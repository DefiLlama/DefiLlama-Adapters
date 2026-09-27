const { sumTokens, sumTokensExport, queryContractWithAbi, toBech32 } = require('../helper/chain/elrond')

// https://docs.ashswap.io/developers/smart-contracts, getAllPoolAddresses covers both stable and v2 (crypto) pools
const ROUTER = 'erd1qqqqqqqqqqqqqpgqjtlmapv42pcga5nglgfrnpqvkq06wdqx4fvsvw6xpt'

async function tvl(api) {
  const pools = await queryContractWithAbi({ target: ROUTER, funcName: 'getAllPoolAddresses', outputType: 'Address', multiValue: true })
  return sumTokens({ owners: pools.map((hex) => toBech32(hex)), balances: api.getBalances() })
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: sumTokensExport({ owner: 'erd1qqqqqqqqqqqqqpgq58elfqng8edp0z83pywy3825vzhawfqp4fvsaldek8' }),
  },
}
