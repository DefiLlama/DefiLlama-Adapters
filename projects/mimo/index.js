const {sumTokens2 } = require("../helper/unwrapLPs.js")
const {
    config,
  } = require("./config.js");

module.exports = {
    methodology: `TVL is retrieved on-chain by getting the total assets managed by the Parallelizer contracts`,
};

async function tvl(api) {
    const chainConfig = config[api.chain]
    const ownerTokens = []
    if(chainConfig.vaultCore){
        const v2TokensAndOwners = await getOwnerTokensV2(api, chainConfig.vaultCore)
        ownerTokens.push(...v2TokensAndOwners)
    }
    if(chainConfig.parallelizer){
        const v3TokensAndOwners = await getOwnerTokensV3(api, chainConfig.parallelizer)
        ownerTokens.push(v3TokensAndOwners)
    }
    return sumTokens2({ api, ownerTokens })
}

async function getOwnerTokensV2(api, vaultCore){
    const ownerTokens = []
    for (const vault of vaultCore) {
      const addressProvider = await api.call({  abi: 'address:a', target: vault})
      const config = await api.call({  abi: 'address:config', target: addressProvider})
      const tokenConfig = await api.fetchList({  lengthAbi: 'numCollateralConfigs', itemAbi: "function collateralConfigs(uint256 _id) view returns ((address collateralType, uint256 debtLimit, uint256 liquidationRatio, uint256 minCollateralRatio, uint256 borrowRate, uint256 originationFee, uint256 liquidationBonus, uint256 liquidationFee))", target: config})
      const tokens = tokenConfig.map(t => t.collateralType)
      ownerTokens.push([tokens, vault])
    }
    return ownerTokens
}

async function getOwnerTokensV3(api, parallelizer){
    const {address: parallelizerAddress, fromBlock} = parallelizer
    const collaterals = await api.call({  abi: 'address[]:getCollateralList', target: parallelizerAddress, block: fromBlock})
    return [collaterals, parallelizerAddress]
}


Object.keys(config).forEach(chain => {
    module.exports[chain] = { tvl }
});
