const { getLogs, getAddress } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(_, _b, _cb, { api }) {
  const { factory, fromBlock, } = config[api.chain];
  let logs;
  let ownerTokens = []

  logs = await getLogs({
    api,
    target: factory,
    topics: [
      "0x2f1b8eb894d0dec568c80b800c0591fc8b05b58054cbe55a6ec63b322019e095",
    ],
    fromBlock,
  });

  ownerTokens.push(...logs.map((i) => {
    vault  = getAddress(i.topics[1])
    return [
      token_list,
      vault
    ];
  }))
  return sumTokens2({
    api,
    ownerTokens,
    permitFailure: true,
  });
}
const config = {
  arbitrum: {
    factory: "0x2eaA3A5223FCb7A9EeC3bFCD399A4c479c6008f6",
    fromBlock: 166573084,
  },
};
token_list = ["0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", ADDRESSES.null]
Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});