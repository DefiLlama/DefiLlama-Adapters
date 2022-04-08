const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const PoolFactory = "0x969d7DDbE3b6F8b51E26D8473AaAC1a9f4a6b47B";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const START_BLOCK = 14443222;

const ethereumTVL = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const Logs = (
    await sdk.api.util.getLogs({
      target: PoolFactory,
      topic: "PoolCreated(address,address,address,bool)",
      keys: [],
      fromBlock: START_BLOCK,
      toBlock: ethBlock,
    })
  ).output;

  for (let i = 0; i < Logs.length; i++) {
    const pool = "0x" + Logs[i].topics[1].substring(26, 66);
    const poolSize = (
      await sdk.api.abi.call({
        abi: abi.poolSize,
        target: pool,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, `ethereum:${USDC}`, poolSize);
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethereumTVL,
  },
  methodology: "We count liquidity by USDC deposited on the pools contracts",
};
