const createVaultModel = (poolAddress, vaultAddress) => {
  return {
    pool: poolAddress,
    vault: vaultAddress,
    chain: 'avax',
  }
}


const vaults = [
  //usdcAvax
  {
    ...createVaultModel('0xa389f9430876455c36478deea9769b7ca4e3ddb1', '0x8025d4deDa0C7512d44438a7DC597612B4108F07'),
  },
  //wethAvax
  {
    ...createVaultModel('0xfe15c2695f1f920da45c30aae47d11de51007af9', '0xf7AcA362510b327bDAca693611353b6a837cBDB2'),
  },
  //avaxUsdte
  {
    ...createVaultModel('0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256', '0x897Fb124aCdF5A685d9258645ffee0058464817A'),
  },
  //joeAvax [not available]
  {
    ...createVaultModel('0x454e67025631c065d3cfad6d71e6892f74487a15', '0x02e9bc3EF29A3f51EdE6e4c4F70fdcb894CD6Cf5'),
  },
  //wBtcAvax
  {
    ...createVaultModel('0xd5a37dc5c9a396a03dd1136fc76a1a02b1c88ffa', '0x8922E41342C6160fAf4dC40f2c1fCFCd94E98779'),
  },
  //linkAvax
  {
    ...createVaultModel('0x6f3a0c89f611ef5dc9d96650324ac633d02265d3', '0x55F42961b3aD4E2A08f1780C7434dd8EC5f7FcE4'),
  },
  //joeUsdce
  {
    ...createVaultModel('0x67926d973cd8ee876ad210faaf7dffa99e414acf', '0xD9F63Cc588822cD3eF802D900808E946d13CE609'),
  },
  //bnbAvax
  {
    ...createVaultModel('0xeb8eb6300c53c3addbb7382ff6c6fbc4165b0742', '0x4decafaCD4591e52f85e8FE69F82F2400176BB33'),
  },
  //joeUsdte
  {
    ...createVaultModel('0x1643de2efb8e35374d796297a9f95f64c082a8ce', '0xfD127Bc3b6153b043fFD8d7f38272593700b124c'),
  },
  // //spellAvax [not available]
  // {
  //   ...createVaultModel('0x62cf16bf2bc053e7102e2ac1dee5029b94008d99', '0x9eE877279DFE8e5F20614db88e50CD72B4efDEAD'),
  // },
  // //xavaAvax [not available]
  // {
  //   ...createVaultModel('0x72c3438cf1c915ecf5d9f17a6ed346b273d5bf71', '0x54720637Fa477eD87Cd06F674247a649A5168eB6'),
  // },
  //linkeUsdce
  {
    ...createVaultModel('0xb9f425bc9af072a91c423e31e9eb7e04f226b39d', '0x62CA6F1640776070ECa70E09d9AF27352a43a5D8'),
  },
  //wethUsdce
  {
    ...createVaultModel('0x199fb78019a08af2cb6a078409d0c8233eba8a0c', '0x2C858E3181988f2E4458f14768aE204E5BF2Ee0e'),
  },
  //pefiAvax [not available]
  {
    ...createVaultModel('0xb78c8238bd907c42be45aebdb4a8c8a5d7b49755', '0x276F74C24Cc4443Ecb4967Db77572BE50aeD4117'),
  },
  //wbtceAvax
  {
    ...createVaultModel('0x62475f52add016a06b398aa3b2c2f2e540d36859', '0x008E6bf114D686713dC233487e360A158433e519'),
  },
  //aaveAvax
  {
    ...createVaultModel('0xc3e6d9f7a3a5e3e223356383c7c055ee3f26a34f', '0xE7c34e1946A10a3A28BEd4B0Cb5B7F0d85F5368D'),
  },
  //qiAvax
  {
    ...createVaultModel('0x2774516897ac629ad3ed9dcac7e375dda78412b9', '0x0240269d999301d03aAe390104584F7517f52ECd'),
  },
  // //avaxBoo [not available]
  // {
  //   ...createVaultModel('0xebf50b8089a0c5e7c5de23f644fcd723818f65b3', '0xB4a805Ad532BB92501507C9eAc27FD0BAe4d68A1'),
  // },
  // //maiAvax [not available]
  // {
  //   ...createVaultModel('0x23ddca8de11eccd8000263f008a92e10dc1f21e8', '0x2071fD6779B701aa71c4a48b8f37970160e5FE75'),
  // },
  // //h20Avax [not available]
  // {
  //   ...createVaultModel('0x9615a11eaa912eae869e9c1097df263fc3e105f3', '0x6b42A98af10C2E94a6951c94b8Ac5B5EEB23c8AF'),
  // },
]

module.exports = {
  vaults,
}