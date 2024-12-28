const { queryContract } = require('../helper/chain/cosmos')
const ILendPoolContractAddress = "inj1j8pkx3dwsmtgg76shj9jaezxu6v0vj7lpl3dx0";

async function tvl(api) {
  const config = { chain: api.chain, contract: ILendPoolContractAddress }

  const { supported_tokens: tokens } = await queryContract({ ...config, data: { get_supported_tokens: {} } })
  await Promise.all(tokens.map(async ({ denom }) => {
    const bal = await queryContract({ ...config, data: { get_available_liquidity_by_token: { denom } }, })
    api.add(denom, bal)
  }))

  return api.getBalances()
}


async function borrowed(api) {
  const config = { chain: api.chain, contract: ILendPoolContractAddress }
  const { supported_tokens: tokens } = await queryContract({ ...config, data: { get_supported_tokens: {} } })
  await Promise.all(tokens.map(async ({ denom }) => {
    const bal = await queryContract({ ...config, data: { get_total_borrowed_by_token: { denom } }, })
    api.add(denom, bal)
  }))

  return api.getBalances()
}

module.exports = {
  methodology:
    "Counts the collateral balance of various tokens in the iLend pool on the Injective chain.",
  injective: {
    tvl, borrowed,
  }
};
