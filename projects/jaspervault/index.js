const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')
const { tvl: writerInventory, MIGRATION_TIMESTAMP } = require('./writer-inventory')

const legacy = {
  "arbitrum": {
    "owners": [
      "0x34Eda05F73f30B43d4c53cdCE830C27291785F96",
      "0x5ffff66C4BE400185eE9CF903a76e7845b6998d3",
      "0xD02e2EB6Cda2df3c4b3d4157F15e45573DE5BEDa",
      "0x5388504406adAB83be8dCc6FE6dF94B3F44EEeeD"
    ],
    "tokens": [
      ADDRESSES.arbitrum.WBTC,
      ADDRESSES.null,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.ARB,
      ADDRESSES.arbitrum.LINK,
      "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      "0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07",
      "0x050C24dBf1eEc17babE5fc585F06116A259CC77A"
    ]
  },
  "base": {
    "owners": [
      "0x5CDF70b831A84B11FC480528116248BA7F91cc62",
      "0x5CFa6c853De2BC1F64e52DaF3478e51aF642860c"
    ],
    "tokens": [
      ADDRESSES.null,
      ADDRESSES.ethereum.cbBTC,
      ADDRESSES.base.USDC
    ]
  },
  "btr": {
    "owners": [
      "0xB0c78bcC1508CEe4c487C27e65797d421D95da07",
      "0xd3e0c9729d3f379ac3f7326860c5965a3f777294",
      "0x3166cd13b1779cb0234e9b63f42f3e8bb6d7050d"
    ],
    "tokens": [
      ADDRESSES.null,
      "0xf8c374ce88a3be3d374e8888349c7768b607c755",
      ADDRESSES.btr.USDT
    ]
  },
}

const adapter = {
  methodology: 'From 2026-11-26, estimates the gross reference value of system-minted trading inventory held by the configured long/short writer vaults on Jasper (55531). JVUSD, JUSDC and USDC are assumed to equal USD 1; other configured tokens use their latest signed Binance-oracle price recorded on Jasper at or before the balance block, which may be stale. This is not LP net equity or verified redeemable backing; liabilities and PnL adjustments are excluded. Demo vaults/tokens and Base/BSC bridge custody are excluded from the Jasper bucket. Legacy Arbitrum, Base and Bitlayer exports are retained for dates before the migration.',
  misrepresentedTokens: true,
  jaspervault: { tvl: writerInventory, start: '2026-11-26' },
}

for (const [chain, config] of Object.entries(legacy)) {
  const legacyTvl = sumTokensExport(config)
  adapter[chain] = { tvl: async (api) => api.timestamp < MIGRATION_TIMESTAMP ? legacyTvl(api) : {} }
}

module.exports = adapter
