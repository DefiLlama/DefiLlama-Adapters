// This adapter mirrors the shape of `aaveV3Export` in projects/helper/aave.js:
// it discovers reserves via getAllReservesTokens, reads aTokenAddress per reserve
// via getReserveTokensAddresses, and computes TVL as the underlying balance held
// by each aToken plus a separate `borrowed` track from totalVariableDebt +
// totalStableDebt. We can't use the helper directly because two of Vena's
// reserves can't be priced by DefiLlama's coins API as `fluent:<address>`:
//   - Fluent WETH is not listed (priced here as mainnet WETH instead)
//   - sUSDnr is not listed and is not standard ERC4626 — no asset() /
//     convertToAssets(); pricing requires a custom getSharePrice() * USDnr
// So instead of delegating wholesale to aaveV3Export, we inline its mechanics
// and add a PRICE_OVERRIDES dict that computes USD locally for those two
// reserves while letting the remaining reserves flow through the default path.
const { default: BigNumber } = require('bignumber.js');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { fetchURL } = require('../helper/utils');

const POOL_DATA_PROVIDER = '0xb6eEF266933382661827E36fE3f936396e80166E';
const SUSDNR_VAULT = '0x50AE83DBDC44208eDa1Ef722F87Bab0FFB195Eea';

const USDNR_ADDRESS = '0xD48e565561416dE59DA1050ED70b8d75e8eF28f9';
const MAINNET_WETH = 'ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const FLUENT_USDNR = `fluent:${USDNR_ADDRESS}`;

const abi = {
  getAllReservesTokens: 'function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])',
  getReserveTokensAddresses: 'function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)',
  getReserveData: 'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
};

// Reserves whose price cannot be resolved by DefiLlama's coins API as `fluent:<address>`.
// For these we compute USD locally instead of feeding the raw balance into the price layer.
// We avoid the protocol's AaveOracle directly: it is a Pyth Lazer pull oracle and reverts whenever
// the on-chain payload is older than ~30s (most of the time, without an authenticated keeper).
const PRICE_OVERRIDES = {
  // Fluent WETH -> mainnet WETH price (Fluent WETH itself isn't listed on coins.llama.fi).
  ['0x927C469E58Daab257Ea60B2D8c37bEDD2a203A54'.toLowerCase()]: {
    decimals: 18,
    priceFeed: MAINNET_WETH,
    usdPerToken: (_api, prices) => new BigNumber(prices[MAINNET_WETH].price),
  },
  // sUSDnr -> getSharePrice() (USDnr per share, scaled to USDnr's 6 decimals) * USDnr USD price.
  ['0xFa9b3B45587f9fcdE14759121C3868C2733DCbf4'.toLowerCase()]: {
    decimals: 6,
    priceFeed: FLUENT_USDNR,
    usdPerToken: async (api, prices) => {
      const sharePrice = await api.call({ target: SUSDNR_VAULT, abi: 'uint256:getSharePrice' });
      return new BigNumber(sharePrice.toString()).shiftedBy(-6).times(prices[FLUENT_USDNR].price);
    },
  },
};

// Reserves that DefiLlama's coins API prices directly as fluent:<address>.
const DIRECTLY_PRICEABLE = new Set([USDNR_ADDRESS.toLowerCase()]);

async function fetchReserveData(api, isBorrowed) {
  const reserveTokens = await api.call({ target: POOL_DATA_PROVIDER, abi: abi.getAllReservesTokens });

  for (const { symbol, tokenAddress } of reserveTokens) {
    const addr = tokenAddress.toLowerCase();
    if (!PRICE_OVERRIDES[addr] && !DIRECTLY_PRICEABLE.has(addr)) {
      throw new Error(`vena: reserve ${symbol} (${tokenAddress}) has no pricing configured`);
    }
  }

  const calls = reserveTokens.map(({ tokenAddress }) => ({ target: POOL_DATA_PROVIDER, params: tokenAddress }));
  const reserveData = await api.multiCall({
    abi: isBorrowed ? abi.getReserveData : abi.getReserveTokensAddresses,
    calls,
  });

  const feeds = [...new Set(reserveTokens
    .map(t => PRICE_OVERRIDES[t.tokenAddress.toLowerCase()]?.priceFeed)
    .filter(Boolean))];
  const pricesByFeed = feeds.length
    ? (await fetchURL(`https://coins.llama.fi/prices/current/${feeds.join(',')}`)).data.coins
    : {};
  for (const feed of feeds) {
    if (!pricesByFeed[feed]) throw new Error(`vena: no price returned for "${feed}" from coins.llama.fi`);
  }

  // TVL for override reserves needs balanceOf(underlying, aTokenAddress); batch into one multicall.
  const tvlOverrideTargets = !isBorrowed
    ? reserveTokens
        .map((t, i) => ({ token: t.tokenAddress, aTokenAddress: reserveData[i].aTokenAddress }))
        .filter(e => PRICE_OVERRIDES[e.token.toLowerCase()])
    : [];
  const tvlOverrideBalances = tvlOverrideTargets.length
    ? await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: tvlOverrideTargets.map(e => ({ target: e.token, params: e.aTokenAddress })),
      })
    : [];
  const balanceByOverrideToken = Object.fromEntries(
    tvlOverrideTargets.map((e, i) => [e.token.toLowerCase(), tvlOverrideBalances[i]]),
  );

  const tokensAndOwners = [];
  await Promise.all(reserveData.map(async (data, i) => {
    const token = reserveTokens[i].tokenAddress;
    const override = PRICE_OVERRIDES[token.toLowerCase()];

    if (override) {
      const rawAmount = isBorrowed
        ? new BigNumber(data.totalVariableDebt.toString()).plus(data.totalStableDebt.toString())
        : new BigNumber(balanceByOverrideToken[token.toLowerCase()].toString());
      const usdPerToken = await override.usdPerToken(api, pricesByFeed);
      api.addUSDValue(rawAmount.shiftedBy(-override.decimals).times(usdPerToken).toNumber());
    } else if (isBorrowed) {
      api.add(token, data.totalVariableDebt);
      api.add(token, data.totalStableDebt);
    } else {
      tokensAndOwners.push([token, data.aTokenAddress]);
    }
  }));

  await sumTokens2({ api, tokensAndOwners });
  return api.getBalances();
}

module.exports = {
  methodology: "AAVE V3 fork. TVL = each reserve's underlying balance held by its aToken (live liquidity); borrowed = totalVariableDebt + totalStableDebt. Fluent WETH is priced as mainnet WETH (not listed on coins.llama.fi directly); USDnr is priced via coins.llama.fi as fluent:USDnr; sUSDnr is priced via getSharePrice() (USDnr per share) times the USDnr USD price.",
  fluent: {
    tvl: (api) => fetchReserveData(api, false),
    borrowed: (api) => fetchReserveData(api, true),
  },
};
