const abi = require("./abi.json");

const vaults = [
  "0x57bDbb788d0F39aEAbe66774436c19196653C3F2", // USDC
  "0x4c8C6379b7cd039C892ab179846CD30a1A52b125", // DAI
  "0x6962785c731e812073948a1f5E181cf83274D7c6", // WBTC
  "0x3d44F03a04b08863cc8825384f834dfb97466b9B", // WETH
  "0xE11678341625cD88Bb25544e39B2c62CeDcC83f1", // WMATIC
  "0xEB02e1024cC16bCD28adE5A87D46257dc307E18C", // USDC old
  "0xf5e364b9c07222cdec7d371c1422625593966c54", // DAI old
  "0xDF53c53E553524d13Fea7a4170856eb8b9C8a6EF", // WETH old
  "0x7Cd28e21a89325EB5b2395591E86374522396E77", // WBTC old
];

async function tvl(api) {
  const tokens = await api.multiCall({ abi: abi.token, calls: vaults })
  const amounts = await api.multiCall({ abi: abi.totalAssets, calls: vaults })
  api.addTokens(tokens, amounts)
}

module.exports = {
  polygon: {
    tvl,
  },
};
