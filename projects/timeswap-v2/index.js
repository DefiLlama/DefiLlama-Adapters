const { getLogs, getAddress } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

async function tvl(_, _b, _cb, { api }) {
  const { factory, oldFactory, fromBlock, newFactory } = config[api.chain];

  const logs = await getLogs({
    api,
    target: factory,
    topics: [
      "0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab",
    ],
    fromBlock,
  });
  const block = await api.getBlock();

  let ownerTokens = logs.map((i) => {
    return [
      [getAddress(i.topics[2]), getAddress(i.topics[3])],
      getAddress(i.data),
    ];
  });
  if (newFactory) {
    const newLogs = await getLogs({
      api,
      target: newFactory,
      topics: [
        "0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab",
      ],
      fromBlock,
    });
    const newOwnerTokens = newLogs.map((i) => {
      return [
        [getAddress(i.topics[2]), getAddress(i.topics[3])],
        getAddress(i.data),
      ];
    });
    ownerTokens = [...ownerTokens, ...newOwnerTokens];
  }
  if (oldFactory) {
    let oldOwnerTokens;
    const oldLogs = await getLogs({
      api,
      target: oldFactory,
      topics: [
        "0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab",
      ],
      fromBlock,
    });
    oldOwnerTokens = oldLogs.map((i) => {
      const token0 = getAddress(i.data.slice(64, 64 * 2 + 2));
      const token1 = getAddress(i.data.slice(64 * 2, 64 * 3 + 2));
      const pool = getAddress(i.data.slice(64 * 3, 64 * 4 + 2));
      return [[token0, token1], pool];
    });
    ownerTokens = [...ownerTokens, ...oldOwnerTokens];
  }

  return sumTokens2({
    api,
    ownerTokens,
  });
}

const config = {
  polygon: {
    oldFactory: "0xcAB2E5Ba8b3A8d8Bf8B50F0eec12884D0255fB4A",
    factory: "0xcf0aca5c5b7e1bF63514D362243b6c50d5761FE8",
    newFactory: "0x406d3Dfcbe20b642c2262b29b960822975371502",
    fromBlock: 39476334,
  },
  ethereum: {
    factory: "0xcf0aca5c5b7e1bF63514D362243b6c50d5761FE8",
    fromBlock: 16778358,
  },
  arbitrum: {
    factory: "0xcf0aca5c5b7e1bF63514D362243b6c50d5761FE8",
    newFactory: "0x406d3Dfcbe20b642c2262b29b960822975371502",
    fromBlock: 70785970,
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
