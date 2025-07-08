const { PublicKey } = require('@solana/web3.js')
const { get } = require('../helper/http')
const { getConnection } = require('../helper/solana')
const { sliceIntoChunks } = require('../helper/utils')

const url = 'https://realms-tvl.vercel.app/tvl/latest'

const isSolOrStable = (token) => ['sol', 'usd', 'btc', 'eth'].some(i => token.token_symbol.toLowerCase().includes(i))

async function tvl(api, isStaking = false) {
  // const connnection = getConnection()
  let { totalValueUsd: { tokens } } = await get(url)
  const filterFn = isStaking ? i => !isSolOrStable(i) : isSolOrStable
  tokens = tokens.filter(filterFn)
  tokens.forEach(i => api.addUSDValue(i.value))
  /* const decimalsMap = {}
  const _tokens = tokens.map(i => i.token)
  const chunks = sliceIntoChunks(_tokens, 99)

  for (const chunk of chunks) {
    const { value } = await connnection.getMultipleParsedAccounts(chunk.map(i => new PublicKey(i)))
    value.forEach((val, i) => {
      decimalsMap[chunk[i]] = val.data.parsed.info.decimals
    })
  }

  for (const token of tokens)
    api.add(token.token, +token.balance * 10 ** decimalsMap[token.token]) */
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'SOL token and stables held in the contracts are counted under tvl, gov tokens are counted under staking',
  timetravel: false,
  solana: { tvl: api => tvl(api), staking: api => tvl(api, true), }
}
