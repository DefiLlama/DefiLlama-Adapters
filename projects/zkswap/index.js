const { getLogs } = require('../helper/cache/getLogs')
const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')

const configs = [
  { governance: '0x02ecef526f806f06357659fFD14834fe82Ef4B04', main: '0x8ECa806Aecc86CE90Da803b080Ca4E3A9b8097ad', fromBlock: 11841962, },
  { governance: '0x86E527BC3C43E6Ba3eFf3A8CAd54A7Ed09cD8E8B', main: '0x6dE5bDC580f55Bc9dAcaFCB67b91674040A247e3', fromBlock: 12810001, },
]

module.exports = {
  start: 1613135160, // 02/12/2021 @ 01:06pm UTC
  ethereum: {
    tvl: sdk.util.sumChainTvls(configs.map(i => {
      return async function tvl(api) {
        const logs = await getLogs({ api, target: i.governance, eventAbi: 'event NewToken (address indexed token, uint16 indexed tokenId)', onlyArgs: true, fromBlock: i.fromBlock, })
        const tokens = logs.map(log => log.token)
        tokens.push(ADDRESSES.null)
        return api.sumTokens({ owner: i.main, tokens })
      }
    }))
  },
};
