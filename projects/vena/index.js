const { default: BigNumber } = require('bignumber.js');
const { fetchURL } = require('../helper/utils');

const POOL_DATA_PROVIDER = '0xb6eEF266933382661827E36fE3f936396e80166E';
const SUSDNR_VAULT = '0x50AE83DBDC44208eDa1Ef722F87Bab0FFB195Eea';

const USDNR_ADDRESS = '0xD48e565561416dE59DA1050ED70b8d75e8eF28f9';
const MAINNET_WETH = 'ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const FLUENT_USDNR = `fluent:${USDNR_ADDRESS}`;

const RESERVES = [
  {
    symbol: 'WETH',
    address: '0x927C469E58Daab257Ea60B2D8c37bEDD2a203A54',
    decimals: 18,
    priceFeed: MAINNET_WETH,
    calculateUSDPrice: async (_, pricesByToken) => new BigNumber(pricesByToken[MAINNET_WETH].price),
  },
  {
    symbol: 'USDnr',
    address: USDNR_ADDRESS,
    decimals: 6,
    priceFeed: FLUENT_USDNR,
    calculateUSDPrice: async (_, pricesByToken) => new BigNumber(pricesByToken[FLUENT_USDNR].price),
  },
  {
    symbol: 'sUSDnr',
    address: '0xFa9b3B45587f9fcdE14759121C3868C2733DCbf4',
    decimals: 6,
    priceFeed: FLUENT_USDNR,
    // sharePrice() returns USDnr per share scaled by USDnr decimals (6).
    // USD price per sUSDnr = (sharePrice / 10^6) * USDnr_USD_price.
    calculateUSDPrice: async (api, pricesByToken) => {
      const sharePrice = await api.call({ target: SUSDNR_VAULT, abi: 'uint256:getSharePrice' });
      const usdnrPrice = new BigNumber(pricesByToken[FLUENT_USDNR].price);
      return new BigNumber(sharePrice.toString()).shiftedBy(-6).times(usdnrPrice);
    },
  },
];

const RESERVE_BY_ADDRESS = Object.fromEntries(
  RESERVES.map(r => [r.address.toLowerCase(), r]),
);

const abi = {
  getAllReservesTokens: 'function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])',
  getReserveData: 'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
};

async function tvl(api) {
  const onchainReserves = await api.call({ target: POOL_DATA_PROVIDER, abi: abi.getAllReservesTokens });
  for (const r of onchainReserves) {
    if (!RESERVE_BY_ADDRESS[r.tokenAddress.toLowerCase()]) {
      throw new Error(`vena: unconfigured reserve ${r.symbol} (${r.tokenAddress})`);
    }
  }

  const tokens = RESERVES.map(r => r.address);
  const allFeeds = [...new Set(RESERVES.map(r => r.priceFeed))];

  const [reserveData, priceResp] = await Promise.all([
    api.multiCall({ target: POOL_DATA_PROVIDER, abi: abi.getReserveData, calls: tokens }),
    fetchURL(`https://coins.llama.fi/prices/current/${allFeeds.join(',')}`),
  ]);
  const pricesByToken = priceResp.data.coins;

  await Promise.all(RESERVES.map(async (reserve, i) => {
    const usdPerToken = await reserve.calculateUSDPrice(api, pricesByToken);
    const amtTokenSupplied = new BigNumber(reserveData[i].totalAToken.toString()).shiftedBy(-reserve.decimals);
    api.addUSDValue(amtTokenSupplied.times(usdPerToken).toNumber());
  }));
}

module.exports = {
  methodology: 'Total market size of the Vena lending pool on Fluent — sum of each reserve\'s aToken total supply (live, including accrued interest) priced via per-reserve calculateUSDPrice functions. WETH is priced via DefiLlama as mainnet WETH; USDnr is priced via the M^0 token on mainnet; sUSDnr is priced via getSharePrice() on its vault (denominated in USDnr) times the USDnr USD price.',
  fluent: { tvl },
};
