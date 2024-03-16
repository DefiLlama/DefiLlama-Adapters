const { getLogs, } = require("../helper/cache/getLogs");
const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(_, _b, _cb, { api }) {
  const { factory, fromBlock, tokens, } = config[api.chain];

  const logs = await getLogs({
    api,
    target: factory,
    onlyArgs: true,
    eventAbi: 'event CreditAccountDeployed (address indexed creditAccount)',
    fromBlock,
  })
  const owners = logs.map((i) => i.creditAccount)

  return api.sumTokens({ owners, tokens });
}

const config = {
  arbitrum: {
    factory: "0x2eaA3A5223FCb7A9EeC3bFCD399A4c479c6008f6",
    fromBlock: 166573084,
    tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.WETH, ADDRESSES.null]
  },
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})