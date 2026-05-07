const methodologies = require('../helper/methodologies');

async function tvl(api) {
    const vault = '0xcE4602C16f6e83eEa77BFb3CCe6f6BCE9EcBb92E'

    const token = await api.call({
        abi: 'address:asset',
        target: vault,
        params: [],
    });

    const balance = await api.call({
        abi: 'uint256:totalAssets',
        target: vault,
        params: [],
    });

    api.add(token, balance)
}
  
module.exports = {
    methodology: methodologies.lendingMarket,
    wc: {
        tvl
    }
}