const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { queryCanister, decodeCandid, hashCandidLabel } = require('../helper/chain/icp')

const ONESEC_CANISTER = '5okwm-giaaa-aaaar-qbn6a-cai'
const LOCKER = '0x70AE25592209B57F62b3a3e832ab356228a2192C'
const CANDID_LABELS = [
  'Ok',
  'Err',
  'tokens',
  'token',
  'balance',
  'chain',
  'ICP',
  'Base',
  'Ethereum',
  'Arbitrum',
  'BOB',
  'CHAT',
  'GLDT',
  'USDC',
  'USDT',
  'cbBTC',
  'ckBTC',
]
const CANDID_LABELS_MAP = Object.fromEntries(CANDID_LABELS.map(label => [hashCandidLabel(label), label]))

const icpTokens = {
  ICP: { decimals: 8, coingeckoId: 'internet-computer' },
  ckBTC: { decimals: 8, coingeckoId: 'bitcoin' },
  BOB: { decimals: 8, coingeckoId: 'bob-3' },
  CHAT: { decimals: 8, coingeckoId: 'openchat' },
  GLDT: { decimals: 8, coingeckoId: 'gold-dao' },
}

function variantName(value) {
  const variant = Array.isArray(value) ? value[0] : value
  return variant && Object.keys(variant)[0]
}

async function icpTvl() {
  const metadata = decodeCandid(
    await queryCanister({ canisterId: ONESEC_CANISTER, methodName: 'get_metadata' }),
    CANDID_LABELS_MAP
  )[0]
  if (metadata.Err) throw new Error(metadata.Err)

  const balances = {}

  for (const tokenMetadata of metadata.Ok.tokens) {
    const token = variantName(tokenMetadata.token)
    const chain = variantName(tokenMetadata.chain)
    const tokenConfig = icpTokens[token]
    if (!tokenConfig || chain !== 'ICP') continue

    const balance = Number(tokenMetadata.balance)
    if (balance > 0) {
      balances[`coingecko:${tokenConfig.coingeckoId}`] = balance / 10 ** tokenConfig.decimals
    }
  }

  return balances
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts tokens where collateral is custodied: ICP-native tokens reported by the OneSec canister, and EVM-native tokens locked in the locker contract on their respective EVM chains.',
  icp: { tvl: icpTvl },
  ethereum: {
    tvl: sumTokensExport({ owner: LOCKER, tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.cbBTC, ADDRESSES.ethereum.USDT] })
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: LOCKER, tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.ethereum.cbBTC] })
  },
  base: {
    tvl: sumTokensExport({ owner: LOCKER, tokens: [ADDRESSES.base.USDC, ADDRESSES.base.cbBTC] })
  },
}
