const { transformDexBalances } = require("../helper/portedTokens")
const { getLogs } = require('../helper/cache/getLogs')
const { nullAddress } = require("../helper/tokenMapping")
const sdk = require('@defillama/sdk')
const { sliceIntoChunks, sleep } = require("../helper/utils")

async function tvl(api) {
  const factory = '0xcE393b11872EE5020828e443f6Ec9DE58CD8b6c5'
  const logs = await getLogs({
    api,
    target: factory,
    topic: 'NewExchange(address,address)',
    eventAbi: 'event NewExchange(address indexed token, address indexed exchange)',
    onlyArgs: true,
    fromBlock: 13154136,
  })
  const calls = logs.map(i => ({ target: i.token, params: i.exchange })).filter(i => i.target.toLowerCase() !== '0xcE393b11872EE5020828e443f6Ec9DE58CD8b6c5'.toLowerCase())
  const allToken1Res = await api.multiCall({ abi: 'erc20:balanceOf', calls })
  const tokenFilter = (_, i) => allToken1Res[i] && +allToken1Res[i] > 0
  const token1s = calls.map(i => i.target).filter(tokenFilter)
  const exchanges = calls.map(i => i.params).filter(tokenFilter)
  const token1Res = allToken1Res.filter(tokenFilter)
  const chunkedExchanges = sliceIntoChunks(exchanges, 50)
  let token0Res = []
  for (const chunk of chunkedExchanges) {
    let { output: res } = await sdk.api.eth.getBalances({ ...api, targets: chunk, })
    token0Res.push(...res)
    await sleep(3000)
  }
  token0Res = token0Res.map(i => i.balance)

  const data = []
  token1s.map((v, i) => {
    data.push({
      token0: nullAddress,
      token1: v,
      token0Bal: token0Res[i],
      token1Bal: token1Res[i],
    })
  })
  // const pairs = (await api.fetchList({  lengthAbi: 'uint256:tokenCount', itemAbi: "function getTokenWithId(uint256 token_id) view returns (address out)", target: factory })).filter(i => i !== nullAddress)

  return transformDexBalances({ chain: api.chain, data })
}
module.exports = {
  misrepresentedTokens: true,
  thundercore: { tvl },
}
