const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const PirexCVX = "0x35A398425d9f1029021A92bc3d2557D42C8588D7";
const pxGMX = "0x9a592b4539e22eeb8b2a3df679d572c7712ef999";
const pxGLP = "0x0eac365e4d7de0e293078bd771ba7d0ba9a4c892"
const GMX = ADDRESSES.arbitrum.GMX;
const GLP = "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258";
const BTRFLY = "0xc55126051B22eBb829D00368f4B12Bde432de5Da";
const pxBTRFLY = "0x10978Db3885bA79Bf1Bc823E108085FB88e6F02f";

async function ethereum(api) {
  const balances = {};
  const chain = "ethereum";

  const { locked: lockedCVX } = await api.call({
    abi: abi.balances,
    target: ADDRESSES.ethereum.vlCVX,
    params: [PirexCVX],
  });
  const { output: pxBTRFLYSupply } = await sdk.api.erc20.totalSupply({
    target: pxBTRFLY,
    chain
  });

  sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.CVX, lockedCVX);
  sdk.util.sumSingleBalance(balances, BTRFLY, pxBTRFLYSupply, chain);

  return balances;
}

async function arbitrum() {
  const balances = {};
  const chain = "arbitrum";

  const { output: pxGMXSupply } = await sdk.api.erc20.totalSupply({
    target: pxGMX,
    chain,
  });
  const { output: pxGLPSupply } = await sdk.api.erc20.totalSupply({
    target: pxGLP,
    chain,
  });

  sdk.util.sumSingleBalance(balances, GMX, pxGMXSupply, chain);
  sdk.util.sumSingleBalance(balances, GLP, pxGLPSupply, chain);

  return balances;
}

module.exports = {
    methodology: "TVL = Total value of tokens locked in Pirex Vaults",
  ethereum: {
    tvl: ethereum,
  },
  arbitrum: {
    tvl: arbitrum,
  },
};
