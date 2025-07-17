const abi = require("./abi.json");
const { sumTokens2, } = require('../helper/unwrapLPs')
const { getSymbols } = require('../helper/utils')
const { isWhitelistedToken, } = require('../helper/streamingHelper')
const chainContracts = require('./contracts.js')

async function calculateTvl(llamapay, vestingContract, vestingContractV2, paymentsContract, api, isVesting) {
  let tokensAndOwners = llamapay ? await getTokensAndOwners(llamapay, api, false) : []
  const tokens = tokensAndOwners.map(i => i[0])
  const symbolMapping = await getSymbols(api.chain, tokens)
  tokensAndOwners = tokensAndOwners.filter(([token]) => isWhitelistedToken(symbolMapping[token], token, isVesting))
  if (isVesting && vestingContract)
    tokensAndOwners.push(...await getTokensAndOwners(vestingContract, api, true))
  if (isVesting && vestingContractV2)
    tokensAndOwners.push(...await getTokensAndOwners(vestingContractV2, api, true))
  const balances = await sumTokens2({ tokensAndOwners, api, resolveLP: false, }) // resolveLP: false maybe breaking them down returns too high TVL for some reason
  if(paymentsContract && !isVesting) {
    return await sumTokens2({ balances, owners: [paymentsContract], fetchCoValentTokens: true, api})
  }
  return balances
}

async function getTokensAndOwners(contract, api, isVestingContract) {
  const abis = {
    count: isVestingContract ? abi.escrows_length : abi.getLlamaPayContractCount,
    vault: isVestingContract ? abi.escrows : abi.getLlamaPayContractByIndex,
  }
  const llamaPayContracts = await api.fetchList({ lengthAbi: abis.count, itemAbi: abis.vault, target: contract })
  const llamaPayTokens = await api.multiCall({ calls: llamaPayContracts, abi: abi.token, })
  return llamaPayTokens.map((token, i) => ([token, llamaPayContracts[i]]))
}

chainContracts.forEach(chain => {
  module.exports[chain.chain] = {
    tvl: async (api) => calculateTvl(chain.llamapayFactoryAddress, chain.vestingFactory, chain.vestingFactory_v2, chain.paymentsContract, api, false),
    vesting: async (api) => calculateTvl(chain.llamapayFactoryAddress, chain.vestingFactory, chain.vestingFactory_v2, chain.paymentsContract, api, true),
  }
})