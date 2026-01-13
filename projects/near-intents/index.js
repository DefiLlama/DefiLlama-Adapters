// https://docs.near-intents.org/near-intents/treasury-addresses
const { defaultTokens } = require('../helper/cex')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/sumTokens')

const native = ADDRESSES.null
const EVM = ['0x2CfF890f0378a11913B6129B2E97417a2c302680', '0x233c5370CCfb3cD7409d9A3fb98ab94dE94Cb4Cd', '0xbb2f33f73ccc2c74e3fb9bb8eb75241ac15337e0']
const blacklistedTokens = [ADDRESSES.ethereum.sUSD_OLD, ADDRESSES.xdai.DAI_1]

const CONFIG = {
  ethereum: { owners: EVM },
  arbitrum: { owners: EVM },
  base: { owners: EVM },
  optimism: { owners: EVM },
  polygon: { owners: EVM },
  avax: { owners: EVM },
  monad: { owners: EVM, tokens: [native] },
  berachain: { owners: EVM, tokens: [native, '0x779ded0c9e1022225f8e0630b35a9b54be713736'] },
  xdai: { owners: EVM, tokens: [native, '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0', '0x8e34bfec4f6eb781f9743d9b4af99cd23f9b7053', '0x177127622c4a00f3d409b75571e12cb3c8973d3c'] },
  bsc: { owners: EVM, tokens: ['0x000ae314e2a2172a039b26378814c252734f556a', '0x4c067de26475e1cefee8b8d1f6e2266b33a2372e'] },

  solana: { owners: ['HWjmoUNYckccg9Qrwi43JTzBcGcM1nbdAtATf9GXmz16', '8sXzdKW2jFj7V5heRwPMcygzNH3JZnmie5ZRuNoTuKQC', '9WL2A89YBr6X47ABKYNzPentWiBA3H8tpaiuf5CaYHx6'] },
  ton: { owners: ['EQDgTfO4pJ8LxznVfC0mHsGl94bQBU4KFcJfliAIHebQU2G4', 'EQANEViM3AKQzi6Aj3sEeyqFu8pXqhy9Q9xGoId_0qp3CNVJ', 'UQAfoBd_f0pIvNpUPAkOguUrFWpGWV9TWBeZs_5TXE95_trZ'] },

  bitcoin: { owners: ['1C6XJtNXiuXvk4oUAVMkKF57CRpaTrN5Ra'] },
  doge: { owners: ['DRmCnxzL9U11EJzLmWkm2ikaZikPFbLuQD'] },
  ripple: { owners: ['r9R8jciZBYGq32DxxQrBPi5ysZm67iQitH'] },

  litecoin: { owners: ['LQjEMkuiA2pCwFeUPwsu6ktzUubBVLsahX'] },
  
  tron: { owners: ['TX5XiRXdyz7sdFwF5mnhT1QoGCpbkncpke', 'TNzQzT8wDF1GVevMqehVDY51ucxxrNfCap'] },
  near: { owners: ['intents.near'], tokens: ['zec.omft.near', 'wrap.near', 'token.rhealab.near'] },
  
  sui: { owners: ['0x00ea18889868519abd2f238966cab9875750bb2859ed3a34debec37781520138', '0x1f6cd55584e6d0c19ae34bfc48b1bd9b1b8a166987e34052cfea7f3c795c6d76'] },
  aptos: { owners: ['0xd1a1c1804e91ba85a569c7f018bb7502d2f13d4742d2611953c9c14681af6446', '0x107b277f8ac97230f1e53cf3661b3f05a40c5a02d1d2b74fe77826b62b4d1c43'] }
}

const tvl = async (api) => {
  const chain = api.chain
  const { owners = [], tokens = [] } = CONFIG[chain]
  const _tokens = [...new Set([...tokens, ...defaultTokens[chain] ?? [], ...Object.values(ADDRESSES[chain] || {})])]
  return sumTokens({ api, chain, tokens: _tokens, owners, blacklistedTokens })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL calculated from tokens locked in NEAR Intents Verifier contract across multiple chains'
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})