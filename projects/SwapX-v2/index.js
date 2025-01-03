const { transformDexBalances } = require("../helper/portedTokens");
const { getLogs } = require("../helper/cache/getLogs");

const SWAPX_V2_FACTORY = "0x05c1be79d3aC21Cc4B727eeD58C9B2fF757F5663"
const PAIR_CREATED_TOPIC_1 = "0xc4805696c66d7cf352fc1d6bb633ad5ee82f6cb577c453024b6e0eb8306c6fc9";  // keccak256 hash of the event signature
const PAIR_CREATED_EVENT_ABI_1 = "event PairCreated(address indexed token0, address indexed token1, bool stable, address pair, uint)";
const fromBlock = 1333667;
const erc20Abi = "erc20:balanceOf";

async function tvl(api) {
  const getPairs = (logs) => {
    return logs.map(log => ({
      token0: log.token0,
      token1: log.token1,
      pair: log.pair
    }));
  }

  const logs = getPairs(await getLogs({
    api,
    target: SWAPX_V2_FACTORY,
    fromBlock,
    topic: PAIR_CREATED_TOPIC_1,
    onlyArgs: true,
    eventAbi: PAIR_CREATED_EVENT_ABI_1
  }));

  const tok0Bals = await api.multiCall({ abi: erc20Abi, calls: logs.map(log => ({ target: log.token0, params: log.pair })) })
  const tok1Bals = await api.multiCall({ abi: erc20Abi, calls: logs.map(log => ({ target: log.token1, params: log.pair })) })

  return transformDexBalances({
    chain: api.chain, 
    data: logs.map((log, i) => ({
      token0: log.token0,
      token0Bal: tok0Bals[i],
      token1: log.token1,
      token1Bal: tok1Bals[i],
    }))
  })
}

module.exports = {
  misrepresentedTokens: true,
  sonic: {
    tvl
  }
};
