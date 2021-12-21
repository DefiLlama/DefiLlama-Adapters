const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const vaults = [
  "0x57bDbb788d0F39aEAbe66774436c19196653C3F2", // USDC
  "0x4c8C6379b7cd039C892ab179846CD30a1A52b125", // DAI
  "0x6962785c731e812073948a1f5E181cf83274D7c6", // WBTC
  "0x3d44F03a04b08863cc8825384f834dfb97466b9B", // WETH
  "0xE11678341625cD88Bb25544e39B2c62CeDcC83f1", // WMATIC
];

async function tvl(time, ethBlock, chainBlocks) {
  const chain = "polygon";
  const block = chainBlocks[chain];
  const calls = vaults.map((v) => ({ target: v }));
  const tokens = await sdk.api.abi.multiCall({
    calls,
    block,
    chain,
    abi: abi.token,
  });
  const amounts = await sdk.api.abi.multiCall({
    calls,
    block,
    chain,
    abi: abi.totalAssets,
  });
  const balances = {};
  for (let i = 0; i < tokens.output.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      chain + ":" + tokens.output[i].output,
      amounts.output[i].output
    );
  }
  return balances;
}

module.exports = {
  polygon: {
    tvl,
  },
};
