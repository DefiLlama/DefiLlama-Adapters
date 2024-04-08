const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')

const api3_token = '0x0b38210ea11411557c13457d4da7dc6ea731b88a'
const api3_dao_pool = '0x6dd655f10d4b9e242ae186d9050b68f725c76d76'
const api3CirculatingSupply = "0xcD34bC5B03C954268d27c9Bc165a623c318bD0a8"

const stakingTVL = async (api) => {
  const balances = {}
  const locked_and_vested = await api.call({
    target: api3CirculatingSupply,
    abi: "uint256:getLockedVestings",
  })

  sdk.util.sumSingleBalance(balances,api3_token,locked_and_vested * -1, api.chain)
  return sumTokens2({ owner: api3_dao_pool, tokens: [api3_token], balances, api })
}

module.exports = {
  ethereum: {
    staking: stakingTVL, // tvl / staking
    tvl: () => ({})
  },
  methodology: 'API3 TVL is all API3 token staked in the API3 DAO Pool contract',
}
