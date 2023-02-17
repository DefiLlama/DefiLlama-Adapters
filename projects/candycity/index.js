const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http');
const { staking, stakings } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const chainTvl = getUniTVL({
  factory: '0x84343b84EEd78228CCFB65EAdEe7659F246023bf',
  chain: 'cronos',
  useDefaultCoreAssets: true
})

const CANDY_TOKEN = '0x06C04B0AD236e7Ca3B3189b1d049FE80109C7977';

const CMC_API_URL = 'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/market-pairs/latest?slug=bored-candy-city'

const STAKING_CONTRACTS = [
  '0xDAf7c0e2882818b46c36AdBCe95399821Eca08F8', // masterchef
  '0x8FEf43b1f3046F8f58A76c64aD01Bc8d82ff0ad1', // candy vault
  '0xA46C4a3428a5E9B5C84A4457215D98BC8DC17AbB', // candy fixed nft staking pool
  '0xCa207941946218126BD7BBe44C5d457753490b4A', // candy shared nft staking pool
  '0x7CeA583ea310b3A8a72Ed42B3364aff16d24B3A2', // candy lock
  '0xE56C1A8D4E90d82BA06F3f49efEc69f736a32070', // candy => wcro pool
  '0xc568Ce4C714c5Ec819eA8F52596a6Fd9523A2B81', // candy => warz pool,
];

const VESTING_CONTRACTS = [
  '0x427f1230A547566a51F5Ffd5698BB65c06acA2D2', // candy vesting
]

async function fetchTvl(timestamp, ethBlock, chainBlocks) {
  let cmc_response = await get(CMC_API_URL)
  const candyPrice = cmc_response.data.marketPairs[0].price
  const balances = await stakings(STAKING_CONTRACTS, CANDY_TOKEN, "cronos")(timestamp, ethBlock, chainBlocks)
  const candyBalances = Object.values(balances)[0]

  return toUSDTBalances(BigNumber(candyBalances).times(BigNumber(candyPrice)).div(1e18));
}

async function fetchVesting(timestamp, ethBlock, chainBlocks) {
  let cmc_response = await get(CMC_API_URL)
  const candyPrice = cmc_response.data.marketPairs[0].price
  const balances = await stakings(VESTING_CONTRACTS, CANDY_TOKEN, "cronos")(timestamp, ethBlock, chainBlocks)
  const candyBalances = Object.values(balances)[0]

  return toUSDTBalances(BigNumber(candyBalances).times(BigNumber(candyPrice)).div(1e18));
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x84343b84EEd78228CCFB65EAdEe7659F246023bf) is used to find the LP pairs. TVL is equal to the liquidity on the AMM and the candy tokens in the staking pools / vault / vesting contract / lock contract.",
  cronos: {
    tvl:  chainTvl,
    staking: fetchTvl,
    vesting: fetchVesting

  },
}; // node test.js projects/crodex/index.js
