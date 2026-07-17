const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// bot.fun: AI-agent launchpad on Eden where coins trade against bonding curves
// priced in native TIA. All curve reserves are held by the factory contract.
// https://bot.fun | contracts: https://bot.fun/api/v1/chain
const FACTORY = '0x279dc5E05d43644C6cd2F2813F306a320e785cdD'

async function tvl(api) {
  await sumTokensExport({ owner: FACTORY, tokens: [ADDRESSES.null] })(api)
  const accruedRewards = await api.call({
    target: FACTORY,
    abi: 'uint256:totalAccruedUnclaimed',
    permitFailure: true,
  })
  api.add(ADDRESSES.null, -(accruedRewards ?? 0))
}

module.exports = {
  methodology: 'TVL is the native TIA held in the bot.fun factory contract as bonding curve reserves, excluding accrued creator and referral rewards.',
  eden: {
    tvl,
  },
}
