const { queryContracts, queryContract, sumTokens } = require('../helper/chain/cosmos')

// LDEX pair contracts on luxa-1. Code 1 (genesis pairs) only hold bank denoms;
// code 4 pairs can hold a CW20 side, reported by `pair_info`
const LEGACY_PAIR_CODE_ID = 1
const PAIR_CODE_ID = 4

async function tvl(api) {
  const legacyPairs = await queryContracts({ chain: api.chain, codeId: LEGACY_PAIR_CODE_ID })
  const pairs = await queryContracts({ chain: api.chain, codeId: PAIR_CODE_ID })

  for (const pair of pairs) {
    const { token_a, token_b, reserve_a, reserve_b } = await queryContract({ api, contract: pair, data: { pair_info: {} } })
    if (token_a.startsWith('luxa1')) api.add(token_a, reserve_a)
    if (token_b.startsWith('luxa1')) api.add(token_b, reserve_b)
  }

  return sumTokens({ api, owners: [...legacyPairs, ...pairs] })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts the native bank and CW20 reserves held by LDEX AMM pair contracts on LUXA.',
  luxa: { tvl },
}
