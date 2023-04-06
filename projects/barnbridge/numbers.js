const { getUniqueAddresses } = require('../helper/utils')

const liquidityProviderBalancesForTerms = async (api, terms) => {
  const providers = getUniqueAddresses(terms.map(i => i.provider))
  const tokens = await api.multiCall({  abi: 'address:underlying', calls: providers}) 
  const balances = await api.multiCall({  abi: 'uint256:underlyingBalance', calls: providers}) 
  console.log(tokens, balances)
  api.addTokens(tokens, balances)
};

module.exports = {
  liquidityProviderBalancesForTerms,
};
