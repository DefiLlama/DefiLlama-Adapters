const { sumTokensExport } = require('../helper/sumTokens')
const sdk = require('@defillama/sdk')

const SWAP_CONTRACT = '0x640cB7201810BC920835A598248c4fe4898Bb5e0'
const TAKER_ADDRESSES_ABI = 'function getTakerAddresses() view returns (string[] receivers, string[] senders)'

const ETH_TOKENS = [
  '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
  '0x57e114B691Db790C35207b2e685D4A43181e6061', // ENA
  '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3', // ONDO
  '0x56072C95FAA701256059aa122697B133aDEd9279', // SKY
  '0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIB
  '0x6982508145454Ce325dDbE47a25d4ec3d2311933', // PEPE
  '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', // SPX
]

const BSC_TOKENS = [
  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
  '0xfb5B838b6cfEEdC2873aB27866079AC55363D37E', // FLOKI
]

const SOLANA_TOKENS = [
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8BopzLHYxdM65zcjm', // WIF
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', // TRUMP
  '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv', // PENGU
  'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn', // PUMP
]

const isEVMAddress = address => /^0x[0-9a-fA-F]{40}$/.test(address)
const isBitcoinAddress = address => /^(1|3|bc1)/.test(address)
const isDogeAddress = address => /^D/.test(address)
const isRippleAddress = address => /^r/.test(address)
const isCardanoAddress = address => /^addr/.test(address)
const isSolanaAddress = address => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  && !isBitcoinAddress(address)
  && !isDogeAddress(address)
  && !isRippleAddress(address)
  && !isCardanoAddress(address)

async function getTakerAddresses(api) {
  const baseApi = api.chain === 'base' ? api : new sdk.ChainApi({ chain: 'base', timestamp: api.timestamp })
  const [receivers] = await baseApi.call({ target: SWAP_CONTRACT, abi: TAKER_ADDRESSES_ABI })
  return [...new Set(receivers)]
}

async function getOwners(api, filter) {
  return (await getTakerAddresses(api)).filter(filter)
}

async function evmTvl(api, tokens) {
  const owners = await getOwners(api, isEVMAddress)
  return sumTokensExport({ owners, tokens })(api)
}

async function solanaTvl(api) {
  const owners = await getOwners(api, isSolanaAddress)
  const tokensAndOwners = SOLANA_TOKENS.map(token => owners.map(owner => [token, owner])).flat()
  return sumTokensExport({ tokensAndOwners, computeTokenAccount: true, allowError: true })(api)
}

async function chainTvl(api, filter, normalize = address => address) {
  const owners = (await getOwners(api, filter)).map(normalize)
  return sumTokensExport({ owners })(api)
}

module.exports = {
  methodology: `TVL counts assets held in SSI protocol custody addresses on each chain. Custody addresses are fetched from the SSI swap contract (${SWAP_CONTRACT}) getTakerAddresses() on Base; basket composition view functions are not used for TVL.`,
  ethereum: {
    tvl: api => evmTvl(api, ETH_TOKENS),
  },
  bsc: {
    tvl: api => evmTvl(api, BSC_TOKENS),
  },
  solana: {
    tvl: solanaTvl,
  },
  bitcoin: {
    tvl: api => chainTvl(api, isBitcoinAddress),
  },
  doge: {
    tvl: api => chainTvl(api, isDogeAddress),
  },
  ripple: {
    tvl: api => chainTvl(api, isRippleAddress, address => address.split(':')[0]),
  },
  cardano: {
    tvl: api => chainTvl(api, isCardanoAddress),
  },
}
