
const { searchAccountsAll, } = require("../helper/algorand");
const { sumTokens, tokens, lookupApplications, } = require('../helper/algorand')
const { transformBalances } = require('../helper/portedTokens')
const chain = 'algorand'

const treasuryAddress = "MTMJ5ADRK3CFG3HGUI7FS4Y55WGCUO5CRUMVNBZ7FW5IIG6T3IU2VJHUMM"
const v2TreasuryAddress = "52O7EFC7TQPGSSM7HE6NDXMUUYM2W5OI4IOCDPTYJLPUYDO7BMNK5SCPEY"

const gardId = 684649988
const gardPriceValidatorId = 684650147
const v2GardPriceValidatorId = 890603991
const gAlgoId = 793124631
const sgardGardId = 890603920

function getStateUint(state, key) {
  const val = state.find((entry) => {
    if (entry.key === key) {
      return entry;
    }
  })
  return val.value.uint
}

async function getAppState(appId) {
  const res = await lookupApplications(appId);
  return res.application.params["global-state"];
}

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
  return transformBalances(chain, { 1: algoBal, ['' + gAlgoId]: gAlgoBal })
}

async function staking() {
  const stakingGARDId = 890604041
  const state = await getAppState(stakingGARDId)
  let gardBal = 0
  const keys = [btoa("NL"), btoa("NLL"), btoa("3M"), btoa("6M"), btoa("9M"), btoa("12M")]
  state.forEach(current => keys.forEach(k => gardBal += current.key === k ? current.value.uint : 0))
  return transformBalances(chain, { ['' + gardId]: gardBal })
}

async function getV2GardDebt() {
  const validatorState = await getAppState(v2GardPriceValidatorId);
  const SGardDebt = getStateUint(validatorState, btoa('SGARD_OWED'))

  const sgardState = await getAppState(sgardGardId);
  const SGardConversion = getStateUint(sgardState, btoa('conversion_rate'))

  return (SGardDebt * SGardConversion / 1e10)
}

/* Get total borrows */
async function borrowed() {
  return transformBalances(chain, { ['' + gardId]: await getV2GardDebt() })
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2022-10-06') / 1e3), 'Gard V2 mainnet launch'],
  ],
  timetravel: false,
  algorand: {
    tvl,
    treasury,
    borrowed,
    staking,
  }
}
