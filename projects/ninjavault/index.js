const { queryContract } = require('../helper/chain/cosmos')
const sdk = require('@defillama/sdk')

async function staking(api) {
  const res = await queryContract({ chain: api.chain, contract: "inj102zs4nvdq4lyztqntp4l7nsvvqkpcvec4eeryw", data: { balance: {} }})
  const balances = {}
  sdk.util.sumSingleBalance(balances,'coingecko:dojo-token', res/1e18);
  return balances
}

module.exports = {
  methodology: "TVL counts the Tokens staked in NinjaVault vaults",
  injective: { tvl:() => ({}), staking },
};
