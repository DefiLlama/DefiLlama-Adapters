const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// bot.fun: AI-agent launchpad on Eden where coins trade against bonding curves
// priced in native TIA. All curve reserves are held by the factory contract.
// https://bot.fun | contracts: https://bot.fun/api/v1/chain
const FACTORY = '0x279dc5E05d43644C6cd2F2813F306a320e785cdD'

module.exports = {
  methodology: 'TVL is the native TIA held in the bot.fun factory contract, which holds the bonding curve reserves of every coin launched on the platform.',
  eden: {
    tvl: sumTokensExport({ owner: FACTORY, tokens: [ADDRESSES.null] }),
  },
}
