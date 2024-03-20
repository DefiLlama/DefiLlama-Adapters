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
    tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.WETH, ADDRESSES.null ,"0x9aa3C3d624e1503bE3B6808bb45b0608F3Ad6841", "0xB9Fe0EC178163a66f2BAf8eD97E057964cCaE876", "0xe1B68841E764Cc31be1Eb1e59d156a4ED1217c2C", "0x99c2901d2883F8D295A989544f118e31eC21823e"]
  },
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})