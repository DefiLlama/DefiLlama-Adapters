const { getContractSubState } = require('@defillama/sdk').chains.zilliqa

const ASWAP_CONTRACT_ADDRESS = 'zil1uxfzk4n9ef2t3f4c4939ludlvp349uwqdx32xt'
//seems Zilliqa API take address in legacy format as map key
const STZIL_CONTRACT_ADDRESS_LEGACY = '0xe6f14afc8739a4ead0a542c07d3ff978190e3b92'

async function tvl() {

  //https://dev.zilliqa.com/api/contract-related-methods/api-contract-get-smartcontract-substate/
  const result = await getContractSubState({ contract: ASWAP_CONTRACT_ADDRESS, variable: 'pools', indices: [STZIL_CONTRACT_ADDRESS_LEGACY] })

  //(* POOL token -> Pair{zil_reserve, token_reserve} *)
  //https://github.com/avely-finance/avely-contracts/blob/main/contracts/source/aswap.scilla#L301
  const zil_reserve = result?.pools?.[STZIL_CONTRACT_ADDRESS_LEGACY]?.arguments[0]
  const token_reserve = result?.pools?.[STZIL_CONTRACT_ADDRESS_LEGACY]?.arguments[1]
  if (zil_reserve == undefined || token_reserve == undefined) {
    return
  }

  const balances = {
    'zilliqa': zil_reserve / 1e12,
  }

  return balances
}

module.exports = {
  zilliqa: {
    tvl,
  },
  methodology: 'TVL represents the state of the Aswap pool, which consists of a single liquidity pair: Zilliqa native token vs StZIL token.',
  timetravel: false,
  misrepresentedTokens: true,
}
