const { masterchefExports  } = require('../helper/unknownTokens')

const STAKING_CONTRACT_ARBITRUM = "0xD0834fF6122FF8dcf38E3eB79372C00FAeAFa08B"; //MASTERCHEF ARBITRUM

module.exports = masterchefExports({ chain: 'arbitrum', masterchef: STAKING_CONTRACT_ARBITRUM, nativeToken: '0x88692aD37c48e8F4c821b71484AE3C2878C2A2C6', useDefaultCoreAssets: true, })