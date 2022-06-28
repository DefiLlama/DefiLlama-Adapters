// const { ethereum } = require(".")

const { getNumLockedTokens, getLockedTokenAtIndex} = require('./abis')


const coreTokenWhitelist = {
  cronos: [
    '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23',  // WCRO
    '0xc21223249ca28397b4b6541dffaecc539bff0c59',  // usdc
    '0x66e428c3f67a68878562e79a0234c1f83c208770',  // usdt
    '0xf2001b145b43032aaf5ee2884e456ccd805f677d',  // dai
  ],
  kava: [
    '0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b',  // WKAVA
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f',  // usdc
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c',  // usdt
    '0x765277eebeca2e31912c9946eae1021199b39c61',  // dai
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d' //WETH
  ],
    polygon: [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',  // wmatic
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',  // usdc
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'], // weth
    avalanche: [
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',  // wavax
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',  // usdc
    '0xc7198437980c041c805a1edcba50c1ce5db95118'], // usdt
  }
  

const config = {
  kavaLocker: {
    chain: 'kava',
    locker: '0x99d17986fcffeb42700f6a9fcd15927bf1fd0df3', 
    factory: '0x4FD2c40c25Dd40e9Bf0CE8479bA384178b8671b5',
    startingBlock: 34954
  },
  cronosLockerV1: {
    chain: 'cronos',
    locker: '0x16678dd963D3C17DD5232c0eE9568e19a9ACB2B6', //v1 Contract 
    factory: '0x462C98Cae5AffEED576c98A55dAA922604e2D875',
    startingBlock: 8037  
  },
  cronosLockerV2: {
    chain: 'cronos',
    locker: '0x09Abe30F5E0E01AC12618eF9eD378aA95dF0aE2D', //V2 Contract 
    factory: '0x462C98Cae5AffEED576c98A55dAA922604e2D875',
    startingBlock: 343983 
  },
  polygonLocker: {
    chain: 'polygon',
    locker: '0x36CdC42a5e9DFCeB3a5cC240c7B477645d4E894a',
    factory: '0x5757371414417b8c6caad45baef941abc7d3ab32',
    startingBlock: 23891396
  },
  avaxLocker: {
    chain: 'avax',
    locker: '0xE7e840Be67B9381D164AbA4CDf30E491d7E36201',
    factory: '0x091d35d7F63487909C863001ddCA481c6De47091',
    startingBlock: 9771636 
  },
}

const kavaContractData = [
  { // KavaLocker
    chain: config.kavaLocker.chain,
    contract: config.kavaLocker.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.kava,
    factory: config.kavaLocker.factory
  }
]
const cronosContractData = [
  { // cronosLockerV1
    chain: config.cronosLockerV1.chain,
    contract: config.cronosLockerV1.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.cronos,
    factory: config.cronosLockerV1.factory,
  },
  { // cronosLockerV2
    chain: config.cronosLockerV2.chain,
    contract: config.cronosLockerV2.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.cronos,
    factory: config.cronosLockerV2.factory,
  },
]
const polygonContractData = [
  { // Polygon Locker
    chain: config.polygonLocker.chain,
    contract: config.polygonLocker.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.polygon,
    factory: config.polygonLocker.factory
  },
]


const avalancheContractData = [
  { // AvaxLocker
    chain: config.avaxLocker.chain,
    contract: config.avaxLocker.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.avalanche,
    factory: config.avaxLocker.factory
  },
  
] 


module.exports = {
  kavaContractData,
  cronosContractData,
  polygonContractData,
  avalancheContractData
}