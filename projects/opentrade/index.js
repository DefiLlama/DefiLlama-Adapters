const { getLogs2 } = require('../helper/cache/getLogs')

// Test pools and empty pools that fail on totalAssets()
const BLACKLIST = {
  avax: [
    '0xf5fd160c5037568d38969c0cf4be05f36a3f7560', // XEURC-LIQ-1
    '0x9a57a503e8e72ea240b47491598d7d6a27fb4dbc', // XEMMF
    '0x3c1c7bc69ffcab2cc1ce687764b66ba35d632b7e', // XMMF
    '0xcc2716d82cb4916417f5e3922573245639088592', // xAPFL
    '0x5e11edd61e79b1471179ef6f67d9587455377273', // XEPV
    '0xcdc7859f0486be52af0e9959443e735a578b8131', // xAaveUSDC-ETH
  ],
  plume_mainnet: [
    '0x73de0dde768cbb92683c48c670f3a11057e51dac', // TEST-1
    '0xf1f5b68833abebbfd5a559977b5b91a110286012' // TEST-002
  ],
}

const FACTORY = {
  avax: [
    { address: '0x4D3b32Bb456A6E387682F6CD37FacefE9A219d0c', fromBlock: 59429843 },
  ],
  ethereum: [
    { address: '0x0a3b7bb45ac8e267Cc4E4b2CbDB52B967d82dF18', fromBlock: 22125605 },
    { address: '0x61424410C0BB1C580ed6363FE9405d9e84FA0578', fromBlock: 19329359 },
    { address: '0xc472d3a47719DE5F9d808CA91d7B70BD2138bCAa', fromBlock: 18667715 },
  ],
  plume_mainnet: [
    { address: '0xA9cC3Bcf7C22895dA2A7c32a99276D734840D8d3', fromBlock: 1684555 },
  ],
}

const poolCreatedAbi = 'event PoolCreated (address indexed addr)'

async function tvl(api) {
  const factories = FACTORY[api.chain]

  const poolSet = new Set()
  for (const { address, fromBlock } of factories) {
    const logs = await getLogs2({
      api,
      eventAbi: poolCreatedAbi,
      factory: address,
      fromBlock,
      extraKey: address.toLowerCase(),
    })
    for (const log of logs)
      if (log.addr) poolSet.add(log.addr.toLowerCase())
  }
  const blacklist = (BLACKLIST[api.chain] ?? []).map(a => a.toLowerCase())
  const pools = [...poolSet].filter(p => !blacklist.includes(p))
  if (!pools.length) return

  const [assets, balances] = await Promise.all([
    api.multiCall({ calls: pools, abi: 'address:liquidityAssetAddr' }),
    api.multiCall({ calls: pools, abi: 'uint256:totalAssets' }),
  ])
  pools.forEach((_, i) => {
    if (assets[i] && balances[i]) api.add(assets[i], balances[i])
  })
}

Object.keys(FACTORY).forEach(chain => {
  module.exports[chain] = { tvl }
})