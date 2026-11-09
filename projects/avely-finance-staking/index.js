const { getContractSubState } = require('@defillama/sdk').chains.zilliqa

const STZIL_CONTRACT_ADDRESS = 'zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246'
const DECIMALS = 12

async function tvl(api) {
  //'total_supply' contract field: it's total amount of minted stzil
  //https://github.com/avely-finance/avely-contracts/blob/main/contracts/source/stzil.scilla#L355

  //get 'totalstakeamount' contract field: it's total amount of zil, staked in Zilliqa native staking contract through StZIL contract
  //https://github.com/avely-finance/avely-contracts/blob/main/contracts/source/stzil.scilla#L353
  //https://dev.zilliqa.com/api/contract-related-methods/api-contract-get-smartcontract-substate/
  const result = await getContractSubState({ contract: STZIL_CONTRACT_ADDRESS, variable: 'totalstakeamount' })
  const staked = result?.totalstakeamount
  if (!staked) return
  api.add('zilliqa', staked / (10 ** DECIMALS), { skipChain: true })
}

module.exports = {
  zilliqa: {
    tvl
  },
  methodology: 'TVL represents the sum of stakes denominated in ZIL and staked in the native Zilliqa staking contract via the STZIL contract',
  timetravel: false,
}
