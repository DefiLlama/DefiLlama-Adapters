const { sumTokens, sumTokensExport, nullAddress, sumTokens2 } = require("../helper/unwrapLPs.js");
const { staking } = require("../helper/staking");
const activePoolAbi = "address:activePool"

const chain = "ethereum";

const eth = {
  dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  maha: "0x745407c86df8db893011912d3ab28e68b62e49b0",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  crv3: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
  usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  treasury: "0x43c958affe41d44f0a02ae177b591e93c86adbea",

  mahax: "0xbdd8f4daf71c2cb16cce7e54bb81ef3cfcf5aacb",

  daiMahaPoolUNIV3: "0x8cb8f052e7337573cd59d33bb67b2acbb65e9876",
  arthUsdcPoolUNIV3: "0x031a1d307C91fbDE01005Ec2Ebc5Fcb03b6f80aB",
  arthMahaPoolUNIV3: "0x8a039FB7503B914A9cb2a004010706ca192377Bc",
  arthWethPoolUNIV3: "0xE7cDba5e9b0D5E044AaB795cd3D659aAc8dB869B",
  wethMahaPoolUNIV3: "0xb28ddf1ee8ee014eafbecd8de979ac8d297931c7",

  arthUsdcPoolCRV: "0xb4018cb02e264c3fcfe0f21a1f5cfbcaaba9f61f",
};

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

async function pool2(_, block) {
  const balances = {};

  const tokensAndOwners = [
    // ARTH/CRV - Curve
    // https://curve.fi/#/ethereum/pools/factory-crypto-185/swap
    // Stablecoin part of the pool
    [eth.arth, eth.arthUsdcPoolCRV],
    [eth.usdc, eth.arthUsdcPoolCRV],

    // ARTH/ETH Uniswap 1%
    // https://info.uniswap.org/#/pools/0xe7cdba5e9b0d5e044aab795cd3d659aac8db869b
    // Stablecoin part of the pool
    [eth.arth, eth.arthWethPoolUNIV3],
    [eth.weth, eth.arthWethPoolUNIV3],

    // ARTH/MAHA Uniswap 1%
    // https://info.uniswap.org/#/pools/0x8a039FB7503B914A9cb2a004010706ca192377Bc
    // Stablecoin & Governance token part of the pool
    [eth.arth, eth.arthMahaPoolUNIV3],
    [eth.maha, eth.arthMahaPoolUNIV3],

    // ARTH/USDC Uniswap 1%
    // https://info.uniswap.org/#/pools/0x031a1d307c91fbde01005ec2ebc5fcb03b6f80ab
    // Stablecoin part of the pool
    [eth.arth, eth.arthUsdcPoolUNIV3],
    [eth.usdc, eth.arthUsdcPoolUNIV3],

    // ETH/MAHA Uniswap 1%
    // https://info.uniswap.org/#/pools/0xb28ddf1ee8ee014eafbecd8de979ac8d297931c7
    // Governance part of the pool
    [eth.weth, eth.wethMahaPoolUNIV3],
    [eth.maha, eth.wethMahaPoolUNIV3],
  ];

  return sumTokens(balances, tokensAndOwners, block, chain);
}

async function tvl(_, block, _1,  { api }) {
  const troves = [
    "0x8b1da95724b1e376ae49fdb67afe33fe41093af5", // ETH Trove
  ];
  const pools = await api.multiCall({  abi: activePoolAbi, calls: troves}) 

  return sumTokens2({ owners: pools, tokens: [ nullAddress ]})
}

module.exports = {
  staking: staking(eth.mahax, eth.maha),
  pool2: sumTokensExport({ tokensAndOwners: [
    ['0xdf34bad1D3B16c8F28c9Cf95f15001949243A038', '0x9ee8110c0aacb7f9147252d7a2d95a5ff52f8496'], 
  ]}),
  tvl,
  treasury: sumTokensExport({ owner: eth.treasury, okens: [eth.arth, eth.weth, nullAddress] }),
};
