const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs")

// STAKING
const ethStakingPools = [
  ["0x0CE0f2b998C0a1b0280Dcc95935108781d18E65b", "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544",],
  ["0x4a5573eE3F333260DB50A385F6fFDAc440fc80b1", "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544",],
  ["0xdf4F609134a84aae1D18dCe8d863b099c6455598", "0x910524678C0B1B23FFB9285a81f99C29C11CBaEd",],
];

// POOL2 LPS
const ethPool2LPs = [
  ["0x1D4b2B2a2Ca8762410801b51f128B73743439E39", "0x95583A6F7aAAA56C48b27413d070219e22844435",],
  ["0x1D4b2B2a2Ca8762410801b51f128B73743439E39", "0xB89cf3528A3a62C2f58BDbcFd7C15312a33ce91D",],
  ["0x654def3E97C3F4218C3f49ace81687483C361b2b", "0x27599F0b45008dAD28899e8E278ab191673C9179",],
];

// POOLS
const ethPools = [
  ["0xb3a2AF499aF8f717BB3431968f8e0b038C975686", ADDRESSES.ethereum.WBTC,],
  ["0xde846827cE3022EcD5eFD6ed316a2dEf9AB299B8", ADDRESSES.ethereum.WETH,],
];

// POLYGON POOL2 LPS
const polyPool2LPs = [
  ["0xd0985A2E8410c03B3bB0D7997DA433428D58342f", "0xc0a1dFb85734E465C5dadc5683DE58358C906598",],
  ["0x92Bb3233F59561FC1fEC53EfC3339E4Af8E917F4", "0x69Cb6f98E45c13A230d292bE0a6aF93a6521c39B",],
  ["0x9cb31B03089eca4C0f42554256d0217326D15AE7", "0x2146baC214D9BF2Da56c3d4A69b9149e457F9d8c",],
  ["0xcCeD5cB001D6081c4561bf7911F11Ccd9aAA1474", "0xBbDC1681e43549d3871CF1953D1dD9afF320feF0",],
];

const polyStakingPools = [
  ["0xE699FFCeD532BB43BD2A84C82c73C858758d12cC", "0x5C7F7Fe4766fE8f0fa9b41E2E4194d939488ff1C"],
]

async function pool2(api) {
  const pool = api.chain === "polygon" ? polyPool2LPs : ethPool2LPs;
  return sumTokens2({ api, tokensAndOwners: pool, resolveLP: true, })
}

const tvl = (tokensAndOwners) => async (api) => api.sumTokens({ tokensAndOwners })

module.exports = {
  ethereum: {
    tvl: tvl(ethPools),
    staking: tvl(ethStakingPools),
    pool2,
  },
  polygon: {
    tvl: async () => ({}),
    staking: tvl(polyStakingPools),
    pool2,
  },
};
