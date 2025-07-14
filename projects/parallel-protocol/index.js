
const {
    config,
  } = require("./config.js");

const abi ={
    parallelizer: {
        getCollateralList: 'address[]:getCollateralList',
    }
}

module.exports = {
    methodology: `TVL is retrieved on-chain by getting the total assets managed by the Parallelizer contracts`,
};

async function tvl(api) {
    const { address: parallelizerAddress, fromBlock} = config[api.chain].parallelizer
    const collaterals = await api.call({  abi: abi.parallelizer.getCollateralList, target: parallelizerAddress, block: fromBlock})
    return api.sumTokens({ tokensAndOwners: collaterals.map(collateral => [collateral, parallelizerAddress]) })
}


Object.keys(config).forEach(chain => {
    module.exports[chain] = { tvl }
})