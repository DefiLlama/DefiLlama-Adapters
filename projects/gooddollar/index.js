const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = {
    "currentPriceDAI": "uint256:currentPriceDAI",
    "totalDelegated": "uint256:totalDelegated"
  };
const BigNumber = require("bignumber.js");
const { sumTokens } = require("../helper/unwrapLPs");

const tokens = {
  aUSDC: "0xbcca60bb61934080951369a648fb03df4f96263c",
  DAI: ADDRESSES.ethereum.DAI,
  cDAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
  Gfuse: "0x495d133B938596C9984d462F007B676bDc57eCEC", // GoodDollar on Fuse
  FUSE: "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d", // Fuse on Mainnet
};

const FUSE_STAKING = '0xA199F0C353E25AdF022378B0c208D600f39a6505';
const GOV_STAKING = '0xFAF457Fb4A978Be059506F6CD41f9B30fCa753b0';
const GOV_STAKING_V2 = '0xB7C3e738224625289C573c54d402E9Be46205546';
const RESERVE_ADDRESS = '0xa150a825d425B36329D8294eeF8bD0fE68f8F6E0';
const AAVE_STAKING_V2 = '0x3ff2d8eb2573819a9ef7167d2ba6fd6d31b17f4f';
const COMPOUND_STAKING = '0xD33bA17C8A644C585089145e86E282fada6F3bfd';
const COMPOUND_STAKING_V2 = '0x7b7246c78e2f900d17646ff0cb2ec47d6ba10754';
const COMMUNITY_SAFE = '0x5Eb5f5fE13d1D5e6440DbD5913412299Bc5B5564';
const GOODDOLLAR_DECIMALS = 2;

async function eth(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [tokens.aUSDC, AAVE_STAKING_V2],
      [tokens.cDAI, COMPOUND_STAKING],
      [tokens.cDAI, COMPOUND_STAKING_V2],
      [tokens.cDAI, RESERVE_ADDRESS]
    ]
  })
}

async function fuseStaking(api, chainBlocks) {
  const bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: [
    { target: tokens.Gfuse, params: [GOV_STAKING] },
    { target: tokens.Gfuse, params: [GOV_STAKING_V2] }
  ]})
  const stakedBal = bals.reduce((a,b) => a + +b, 0)
  const ethApi = new sdk.ChainApi({ chain: 'ethereum', timestamp: api.timestamp })
  await api.getBlock()


  const gdInDAI = await convertGoodDollarsToDai(stakedBal, ethApi);
  ethApi.add(tokens.DAI, gdInDAI)
  return ethApi.getBalances()
}

// Required until GoodDollar lists on CoinGecko
async function convertGoodDollarsToDai(gdAmount, api) {

  const gdPriceInDAI = await api.call({
    target: RESERVE_ADDRESS,
    abi: abi.currentPriceDAI,
  })
  return gdPriceInDAI * gdAmount / 100
}

module.exports = {
  methodology: `Aggregation of funds staked in our contracts on Ethereum and Fuse, funds locked in reserve backing G$ token and community treasury. G$ value was converted to USD based on current price at the reserve.`,
  misrepresentedTokens: true,
  ethereum: {
    tvl: eth
  },
  fuse: {
    staking: fuseStaking,
    tvl: () => ({}),
  },
}