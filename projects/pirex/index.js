const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const CVX = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";
const PirexCVX = "0x35A398425d9f1029021A92bc3d2557D42C8588D7";
const CVXLocker = "0x72a19342e8F1838460eBFCCEf09F6585e32db86E";
const pxGMX = "0x9a592b4539e22eeb8b2a3df679d572c7712ef999";
const pxGLP = "0x0eac365e4d7de0e293078bd771ba7d0ba9a4c892"
const GMX = "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a";
const GLP = "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258";

async function ethereum(ts, block, _, { api }) {
  const balances = {};
  const { locked: lockedCVX } = await api.call({
    abi: abi.balances,
    target: CVXLocker,
    params: [PirexCVX],
  });

  sdk.util.sumSingleBalance(balances, CVX, lockedCVX);

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
  timetravel: true,
  methodology: "TVL = Total value of tokens locked in Pirex Vaults",
  ethereum: {
    tvl: ethereum,
  },
  arbitrum: {
    tvl: arbitrum,
  },
};
