const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, sumTokens2 } = require("../helper/unwrapLPs.js");
const { staking } = require("../helper/staking");
const activePoolAbi = "address:activePool"

const eth = {
  dai: ADDRESSES.ethereum.DAI,
  maha: "0x745407c86df8db893011912d3ab28e68b62e49b0",
  weth: ADDRESSES.ethereum.WETH,
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  crv3: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
  usdc: ADDRESSES.ethereum.USDC,

  mahax: "0xbdd8f4daf71c2cb16cce7e54bb81ef3cfcf5aacb",

  daiMahaPoolUNIV3: "0x8cb8f052e7337573cd59d33bb67b2acbb65e9876",
  arthUsdcPoolUNIV3: "0x031a1d307C91fbDE01005Ec2Ebc5Fcb03b6f80aB",
  arthMahaPoolUNIV3: "0x8a039FB7503B914A9cb2a004010706ca192377Bc",
  arthWethPoolUNIV3: "0xE7cDba5e9b0D5E044AaB795cd3D659aAc8dB869B",
  wethMahaPoolUNIV3: "0xb28ddf1ee8ee014eafbecd8de979ac8d297931c7",

  arthUsdcPoolCRV: "0xb4018cb02e264c3fcfe0f21a1f5cfbcaaba9f61f",
};

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

async function tvl(api) {
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
};
