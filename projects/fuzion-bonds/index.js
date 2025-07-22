
const { queryContract, sumTokens } = require('../helper/chain/cosmos')

async function tvl() {
  const data = { fuzion_chain_config: { chain_name: "kujira", network_type: "Mainnet" } }
  const fuzionConfig = await queryContract({ contract: "kujira13rj43lsucnel7z8hakvskr7dkfj27hd9aa06pcw4nh7t66fgt7qsc4qm6v", chain: 'kujira', data: data })
  const bondsContract = fuzionConfig.chain_config.chain_contracts.find(({ contract_name }) => contract_name === "BONDS_FUNGIBLE_TOKEN").contract_address
  const bondsFlowsContract = fuzionConfig.chain_config.chain_contracts.find(({ contract_name }) => contract_name === "BONDS_FLOWS").contract_address
  const owners = [
    bondsContract,
    bondsFlowsContract
  ]

  return sumTokens({ owners, chain: 'kujira' })
}

async function staking() {
  const data = { fuzion_chain_config: { chain_name: "kujira", network_type: "Mainnet" } }
  const fuzionConfig = await queryContract({ contract: "kujira13rj43lsucnel7z8hakvskr7dkfj27hd9aa06pcw4nh7t66fgt7qsc4qm6v", chain: 'kujira', data: data })
  const stakeContract = fuzionConfig.chain_config.chain_contracts.find(({ contract_name }) => contract_name === "CW4_STAKE_GOVERNANCE").contract_address
  const owners = [stakeContract]

  return sumTokens({ owners, chain: 'kujira' })
}


module.exports = {
    kujira: {
    tvl, staking,
  },
}