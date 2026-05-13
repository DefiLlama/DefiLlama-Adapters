// This adapter is a thin wrapper over `aaveV3Export` from projects/helper/aave.js.
// aaveV3Export handles all the AAVE V3 mechanics: discover reserves via
// getAllReservesTokens, read aTokenAddress per reserve, sum balanceOf for TVL,
// and sum totalVariableDebt + totalStableDebt for borrowed.
//
// We can't use the helper as-is because two of Vena's reserves can't be priced
// by DefiLlama's coins API as `fluent:<address>`:
//   - Fluent WETH is not listed (priced here as mainnet WETH instead).
//   - sUSDnr is not listed and is not standard ERC4626 — no asset() /
//     convertToAssets(); pricing requires a custom getSharePrice() * USDnr.
// We avoid the protocol's AaveOracle directly: it's a Pyth Lazer pull oracle
// that reverts whenever the on-chain payload is older than ~30s.
//
// Strategy: let aaveV3Export populate api.balances normally, then call
// applyPriceOverrides() to swap the unpriceable raw balances for explicit
// USD values computed from our own pricing.
const { default: BigNumber } = require('bignumber.js');
const { aaveV3Export } = require('../helper/aave');
const { fetchURL } = require('../helper/utils');

const POOL_DATA_PROVIDER = '0xb6eEF266933382661827E36fE3f936396e80166E';
const SUSDNR_VAULT = '0x50AE83DBDC44208eDa1Ef722F87Bab0FFB195Eea';

const USDNR_ADDRESS = '0xD48e565561416dE59DA1050ED70b8d75e8eF28f9';
const MAINNET_WETH = 'ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const FLUENT_USDNR = `fluent:${USDNR_ADDRESS}`;

const PRICE_OVERRIDES = {
  // Fluent WETH -> mainnet WETH price.
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

// Reserves that DefiLlama's coins API can price directly as fluent:<address>.
const DIRECTLY_PRICEABLE = new Set([USDNR_ADDRESS.toLowerCase()]);

// aaveV3Export leaves balances keyed as `fluent:<reserve>`; DefiLlama can't price
// Fluent WETH or sUSDnr that way, so we swap their raw balances for explicit USD.
async function applyPriceOverrides(api) {
  const balances = api.getBalances();

  // Safety: any unrecognized reserve would silently drop from TVL. Throw instead.
  for (const key of Object.keys(balances)) {
    if (!key.startsWith('fluent:')) continue;
    const addr = key.slice('fluent:'.length).toLowerCase();
    if (!PRICE_OVERRIDES[addr] && !DIRECTLY_PRICEABLE.has(addr)) {
      throw new Error(`vena: reserve ${addr} has no pricing configured`);
    }
  }

  const feeds = [...new Set(Object.values(PRICE_OVERRIDES).map(o => o.priceFeed))];
  const pricesByFeed = (await fetchURL(`https://coins.llama.fi/prices/current/${feeds.join(',')}`)).data.coins;
  for (const feed of feeds) {
    if (!pricesByFeed[feed]) throw new Error(`vena: no price returned for "${feed}" from coins.llama.fi`);
  }

  // Build a case-insensitive lookup over balances so we can find each override's entry
  // regardless of the address casing aaveV3Export wrote.
  const balanceKeyByAddr = {};
  for (const key of Object.keys(balances)) {
    if (!key.startsWith('fluent:')) continue;
    balanceKeyByAddr[key.slice('fluent:'.length).toLowerCase()] = key;
  }

  for (const [addr, override] of Object.entries(PRICE_OVERRIDES)) {
    const key = balanceKeyByAddr[addr];
    const rawAmount = key && balances[key];
    if (rawAmount == null || rawAmount === '0') continue;
    // Zero out the unpriceable balance, then add its USD value explicitly.
    api.add(addr, new BigNumber(rawAmount.toString()).negated().toFixed(0));
    const usdPerToken = await override.usdPerToken(api, pricesByFeed);
    api.addUSDValue(new BigNumber(rawAmount.toString()).shiftedBy(-override.decimals).times(usdPerToken).toNumber());
  }
}

const base = aaveV3Export({ fluent: { poolDatas: [POOL_DATA_PROVIDER] } });

module.exports = {
  methodology: "AAVE V3 fork. TVL = each reserve's underlying balance held by its aToken (live liquidity); borrowed = totalVariableDebt + totalStableDebt. Two reserves need off-protocol pricing: Fluent WETH is priced as mainnet WETH (not listed on coins.llama.fi); sUSDnr is priced as getSharePrice() (USDnr per share) times the USDnr USD price (vault is not ERC4626-conformant).",
  fluent: {
    tvl: async (api) => {
      await base.fluent.tvl(api);
      await applyPriceOverrides(api);
      return api.getBalances();
    },
    borrowed: async (api) => {
      await base.fluent.borrowed(api);
      await applyPriceOverrides(api);
      return api.getBalances();
    },
  },
};
