const abi = require("./abi.json");
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const pool_factoryV1 = "0x20dC7DA7cFc8F5b465060496a170229dc4A47A87";
const pool_factoryV2 = "0xCD21ef2220596cba4A7DaE59b5eeeA6dB7859df7";

const toAddr = (d) => "0x" + d.substr(26);

const calc = async (balances, factory, api) => {
  const START_BLOCK = 11259517; // 11971199 -> start block for Factory Pool V2
  const events = (
    await getLogs({
      target: factory,
      topic: `LOG_NEW_POOL(address,address)`,
      api,
      fromBlock: START_BLOCK,
    })
  );

  const pools = events.map((event) => toAddr(event.topics[2]));
  const tokens = await api.multiCall({
    calls: pools,
    abi: abi.getCurrentTokens,
  })
  const tokensAndOwners = []
  tokens.forEach((t, i) => t.forEach(j => tokensAndOwners.push([j, pools[i]])))
  return sumTokens2({ api, tokensAndOwners, balances })
};

const ethTvl = async (api) => {
  const balances = {};

  await Promise.all([
    /*** Pool V1 TVL Portion ***/
    calc(balances, pool_factoryV1, api),
    /*** Pool V2 TVL Portion ***/
    calc(balances, pool_factoryV2, api),
  ])

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "Counts tvl on the Pools through MFactory (V1 and V2) Contracts",
};
