const config = {
  ethereum:
  {
    vaultCore: [
      '0x68E88c802F146eAD2f99F3A91Fb880D1A2509672', //PAR
      '0x917b9D8E62739986EC182E0f988C7F938651aFD7', //paUSD
    ],
  },
  polygon: {
    vaultCore: [
      '0x78C48A7d7Fc69735fDab448fe6068bbA44a920E6', //PAR
      '0xc0459Eff90be3dCd1aDA71E1E8BDB7619a16c1A4', //paUSD
    ],
  },
  fantom: {
    vaultCore: ['0xB2b4feB22731Ae013344eF63B61f4A0e09fa370e'],
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