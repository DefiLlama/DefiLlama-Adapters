const { transformDexBalances } = require("../helper/portedTokens")
const { getLogs } = require('../helper/cache/getLogs')
const { nullAddress } = require("../helper/tokenMapping")
const sdk = require('@defillama/sdk')
const { sliceIntoChunks } = require("../helper/utils")

async function tvl(_, _b, _cb, { api, }) {
  const factory = '0xcE393b11872EE5020828e443f6Ec9DE58CD8b6c5'
  const logs = await getLogs({
    api,
    target: factory,
    topic: 'NewExchange(address,address)',
    eventAbi: 'event NewExchange(address indexed token, address indexed exchange)',
    onlyArgs: true,
    fromBlock: 13154136,
  })
  const pairs = logs.map(i => i.exchange)
  const tokens = logs.map(i => i.token)
  const token0Res = []
  const token1Res = []

  await Promise.all([
    getToken0Res(),
    getToken1Res(),
  ])
  async function getToken0Res() {
    const token0Chunks = sliceIntoChunks(pairs, 250)
    let i = 0
    for (const chunk of token0Chunks) {
      sdk.log('fetching ', ++i, 'of ', token0Chunks.length)
      const { output } = await sdk.api.eth.getBalances({ ...api, targets: pairs, })
      token0Res.push(...output)
    }
  }
  async function getToken1Res() {
    const token1Chunks = sliceIntoChunks(pairs.map((v, i) => ({ target: tokens[i], params: v })), 50)
    let i = 0
    for (const calls of token1Chunks) {
      sdk.log('fetching ', ++i, 'of ', token1Chunks.length, '(token1)')
      const res = await api.multiCall({ abi: 'erc20:balanceOf', calls })
      token1Res.push(...res)
    }
  }
  const data = []
  tokens.map((v, i) => {
    // if (isNaN(token1Res[i])) sdk.log('bad response', tokens[i], pairs[i])
    // if (isNaN(token0Res[i])) sdk.log('bad response 0', tokens[i], pairs[i])
    data.push({
      token0: nullAddress,
      token1: v,
      token0Bal: isNaN(token0Res[i]) ? 0 : token0Res[i],
      token1Bal: isNaN(token1Res[i]) ? 0 : token1Res[i],
    })
  })
  // const pairs = (await api.fetchList({  lengthAbi: 'uint256:tokenCount', itemAbi: "function getTokenWithId(uint256 token_id) view returns (address out)", target: factory })).filter(i => i !== nullAddress)

  return transformDexBalances({ chain: api.chain, data })
}
module.exports = {
  misrepresentedTokens: true,
  thundercore: { tvl },
}
