const { sumTokens } = require('../helper/sumTokens')

const SWAP_CONTRACT = '0x640cB7201810BC920835A598248c4fe4898Bb5e0'
const takerAbi = 'function getTakerAddresses() view returns (string[] receivers, string[] senders)'

const ETH_TOKENS = [
  '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  '0x57e114B691Db790C35207b2e685D4A43181e6061',
  '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3',
  '0x56072C95FAA701256059aa122697B133aDEd9279',
  '0xD533a949740bb3306d119CC777fa900bA034cd52',
  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
  '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C',
]

const BSC_TOKENS = [
  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  '0xfb5B838b6cfEEdC2873aB27866079AC55363D37E',
]

const SOLANA_TOKENS = [
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8BopzLHYxdM65zcjm',
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
  '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
  'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn',
]

const custodyCache = {}

async function getCustodyOwners(api) {
  if (custodyCache[api.timestamp]) return custodyCache[api.timestamp]
  const { receivers = [], senders = [] } = await api.call({ target: SWAP_CONTRACT, chain: 'base', abi: takerAbi })
  const values = [...receivers, ...senders].filter(Boolean)
  const unique = [...new Set(values)]

  const owners = {
    evm: [],
    solana: [],
    bitcoin: [],
    doge: [],
    ripple: [],
    cardano: [],
  }

  unique.forEach((owner) => {
    const value = owner.trim()
    if (!value) return
    if (/^0x[a-fA-F0-9]{40}$/.test(value)) return owners.evm.push(value)
    if (value.startsWith('addr1')) return owners.cardano.push(value)
    if (value.startsWith('rp')) return owners.ripple.push(value.split(':')[0])
    if (value.startsWith('D')) return owners.doge.push(value)
    if (value.startsWith('1') || value.startsWith('bc1')) return owners.bitcoin.push(value)
    owners.solana.push(value)
  })

  Object.keys(owners).forEach(k => owners[k] = [...new Set(owners[k])])
  custodyCache[api.timestamp] = owners
  return owners
}

async function tvlEthereum(api) {
  const { evm } = await getCustodyOwners(api)
  return sumTokens({ api, chain: 'ethereum', owners: evm, tokens: ETH_TOKENS })
}

async function tvlBsc(api) {
  const { evm } = await getCustodyOwners(api)
  return sumTokens({ api, chain: 'bsc', owners: evm, tokens: BSC_TOKENS })
}

async function tvlSolana(api) {
  const { solana } = await getCustodyOwners(api)
  const tokensAndOwners = SOLANA_TOKENS.map(token => solana.map(owner => [token, owner])).flat()
  return sumTokens({ api, chain: 'solana', tokensAndOwners, computeTokenAccount: true, allowError: true })
}

async function tvlBitcoin(api) {
  const { bitcoin } = await getCustodyOwners(api)
  return sumTokens({ api, chain: 'bitcoin', owners: bitcoin })
}

async function tvlDoge(api) {
  const { doge } = await getCustodyOwners(api)
  return sumTokens({ api, chain: 'doge', owners: doge })
}

async function tvlRipple(api) {
  const { ripple } = await getCustodyOwners(api)
  return sumTokens({ api, chain: 'ripple', owners: ripple })
}

async function tvlCardano(api) {
  const { cardano } = await getCustodyOwners(api)
  return sumTokens({ api, chain: 'cardano', owners: cardano })
}

module.exports = {
  methodology: `TVL counts assets held in SSI custody addresses queried dynamically from getTakerAddresses() on swap contract ${SWAP_CONTRACT}. Basket view functions are not used.`,
  ethereum: { tvl: tvlEthereum },
  bsc: { tvl: tvlBsc },
  solana: { tvl: tvlSolana },
  bitcoin: { tvl: tvlBitcoin },
  doge: { tvl: tvlDoge },
  ripple: { tvl: tvlRipple },
  cardano: { tvl: tvlCardano },
}
