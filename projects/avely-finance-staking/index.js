const {
  formQuery,
  call
} = require('../helper/chain/zilliqa')

const STZIL_CONTRACT_ADDRESS = 'zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246'
const DECIMALS = 12

const tvlFields = {

  //'total_supply' contract field: it's total amount of minted stzil
  //https://github.com/avely-finance/avely-contracts/blob/main/contracts/source/stzil.scilla#L355
  // [STZIL_CONTRACT_ADDRESS]: 'total_supply',

  //get 'totalstakeamount' contract field: it's total amount of zil, staked in Zilliqa native staking contract through StZIL contract
  //https://github.com/avely-finance/avely-contracts/blob/main/contracts/source/stzil.scilla#L353
  'zilliqa': 'totalstakeamount',
}

async function tvl() {
  const { api } = arguments[3]
  const query = prepareQuery(tvlFields)

  const data = await call(query)

  data.forEach((response) => {
    const { id, result } = response
    if (!id || !result || !tvlFields[id] || !result[tvlFields[id]]) return
    api.add(id, result[tvlFields[id]] / (10 ** DECIMALS), { skipChain: true})
  })
}

//prepare batch GetSmartContractSubState query
//https://dev.zilliqa.com/api/contract-related-methods/api-contract-get-smartcontract-substate/
function prepareQuery(fields) {
  const query = Object.entries(fields).map(([id, field]) => {
    return formQuery({
      id: id,
      params: [
        STZIL_CONTRACT_ADDRESS,
        field,
        []
      ]
    });
  });

  //console.log(query)
  return query;
}


module.exports = {
  zilliqa: {
    tvl
  },
  methodology: 'TVL represents the sum of stakes denominated in ZIL and staked in the native Zilliqa staking contract via the STZIL contract',
  timetravel: false,
}

