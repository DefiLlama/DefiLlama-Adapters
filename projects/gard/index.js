
const { searchAccountsAll, sumTokens, tokens, getAppGlobalState, } = require('../helper/chain/algorand')

const treasuryAddress = "MTMJ5ADRK3CFG3HGUI7FS4Y55WGCUO5CRUMVNBZ7FW5IIG6T3IU2VJHUMM"
const v2TreasuryAddress = "52O7EFC7TQPGSSM7HE6NDXMUUYM2W5OI4IOCDPTYJLPUYDO7BMNK5SCPEY"

const gardId = 684649988
const gardPriceValidatorId = 684650147
const v2GardPriceValidatorId = 890603991
const gAlgoId = 793124631
// const sgardGardId = 890603920

async function treasury() {
  const balances = await sumTokens({ owner: treasuryAddress, blacklistedTokens: [tokens.gard] })
  return sumTokens({ balances, owner: v2TreasuryAddress, })
}

async function tvl() {
  let algoBal = 0
  let gAlgoBal = 0
  const validators = [gardPriceValidatorId, v2GardPriceValidatorId]
  await Promise.all(validators.map(async (appId) => {
    // Find accounts that are opted into the GARD price validator application
    // These accounts correspond to CDP opened on the GARD protocol
    const accounts = await searchAccountsAll({ appId })
    for (const account of accounts) {
      algoBal += account.amount
      if (account['total-assets-opted-in'] == 1)
        account['assets'].filter(i => i['asset-id'] === gAlgoId).forEach(i => gAlgoBal += i.amount)
    }
  }))
  return { 'algorand:1': algoBal, ['algorand' + gAlgoId]: gAlgoBal }
}

async function staking() {
  const stakingGARDId = 890604041
  const state = await getAppGlobalState(stakingGARDId)
  let gardBal = 0
  const keys = ["NL", "NLL", "3M", "6M", "9M", "12M"]
  keys.forEach(k => gardBal += state[k] || 0);
  return { ['algorand:' + gardId]: gardBal }
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2022-10-06') / 1e3), 'Gard V2 mainnet launch'],
  ],
  timetravel: false,
  algorand: {
    tvl,
    // treasury,
    staking,
  }
}
