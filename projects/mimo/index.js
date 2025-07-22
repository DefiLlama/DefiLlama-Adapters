const config = {
  ethereum:
  {
    vaultCore: [
      '0x173AE6283A717b6cdD5491EAc5F82C082A8c674b', //PAR
      '0xE26348D30694aa7E879b9335252362Df3df93204', //paUSD
    ],
  },
  polygon: {
    vaultCore: [
      '0x0a9202C6417A7B6B166e7F7fE2719b09261b400f', //PAR
      '0xcABAbC1Feb7C5298F69B635099D75975aD5E6e5f', //paUSD
    ],
  },
  fantom: {
    vaultCore: ['0xF6aBf8a89b3dA7C254bb3207e2eBA9810bc51f58'], //PAR
  }
}


Object.keys(config).forEach(chain => {
  const { vaultCore } = config[chain]
  module.exports[chain] = { tvl }

  async function tvl(api) {
    const ownerTokens = []
    for (const vault of vaultCore) {
      const addressProvider = await api.call({  abi: 'address:a', target: vault})
      const config = await api.call({  abi: 'address:config', target: addressProvider})
      const tokenConfig = await api.fetchList({  lengthAbi: 'numCollateralConfigs', itemAbi: "function collateralConfigs(uint256 _id) view returns ((address collateralType, uint256 debtLimit, uint256 liquidationRatio, uint256 minCollateralRatio, uint256 borrowRate, uint256 originationFee, uint256 liquidationBonus, uint256 liquidationFee))", target: config})
      const tokens = tokenConfig.map(t => t.collateralType)
      ownerTokens.push([tokens, vault])
    }
    return api.sumTokens({ ownerTokens })
  }
})