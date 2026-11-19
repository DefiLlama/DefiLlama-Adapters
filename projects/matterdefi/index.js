const sdk = require('@defillama/sdk')
const { getTokenBalances, getStorage, getBigMapById } = require('../helper/chain/tezos')

const tezos = sdk.chains.tezos

const MATTER_TOKEN = 'KT1K4jn23GonEmZot3pMGth7unnzZ6EaMVjY'
const MATTER_CORE = 'KT1K4jn23GonEmZot3pMGth7unnzZ6EaMVjY'
const MATTER_LIVE = 'KT1FYct7DUK1mUkk9BPJEg7AeH7Fq3hQ9ah3'
const SPICY_FACTORY = 'KT1PwoZxyv4XkPEGnTqWYvjA1UYiPTgAGyqL'

const getSpicyToken = ({ token_id, fa2_address }) => fa2_address + (token_id && token_id !== '0' ? `-${token_id}` : '')

let _data
async function getData() {
  if (!_data) _data = _getData()
  return _data

  async function _getData() {
    // spicyswap pairs are FA2 contracts that are also their own LP token
    const { pairs } = await getStorage(SPICY_FACTORY)
    const spicyPairs = new Set(Object.values(await getBigMapById(pairs)).map(i => i.contract))
    const holdings = {}
    for (const owner of [MATTER_CORE, MATTER_LIVE]) {
      const bals = await getTokenBalances(owner, false, { transformAddress: i => i })
      Object.entries(bals).forEach(([token, bal]) => holdings[token] = (holdings[token] ?? 0) + +bal)
    }
    const res = { tvl: {}, pool2: {}, staking: {} }
    const add = (bucket, token, bal) => sdk.util.sumSingleBalance(res[bucket], 'tezos:' + token, bal)

    for (const [token, bal] of Object.entries(holdings)) {
      if (token === MATTER_TOKEN) {
        add('staking', token, bal)
        continue
      }
      if (!spicyPairs.has(token)) {
        add('tvl', token, bal)
        continue
      }
      const { token0, token1, reserve0, reserve1 } = await getStorage(token)
      const supply = await tezos.getTokenTotalSupply({ contract: token, tokenId: 0 })
      if (!+supply) continue
      const ratio = bal / supply
      const t0 = getSpicyToken(token0)
      const t1 = getSpicyToken(token1)
      const bucket = [t0, t1].includes(MATTER_TOKEN) ? 'pool2' : 'tvl'
      add(bucket, t0, reserve0 * ratio)
      add(bucket, t1, reserve1 * ratio)
    }
    return res
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts the tokens staked in Matter Core & Matter Live farms, with SpicySwap LP tokens resolved to their underlying reserves on chain. LPs containing MTTR are counted as pool2, staked MTTR as staking.',
  tezos: {
    tvl: async () => (await getData()).tvl,
    pool2: async () => (await getData()).pool2,
    staking: async () => (await getData()).staking,
  }
}
