// const { ethereum } = require(".")

const { getNumLockedTokens, getLockedTokenAtIndex} = require('./abis')

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
    factory: config.kavaLocker.factory
  }
]
const cronosContractData = [
  { // cronosLockerV1
    chain: config.cronosLockerV1.chain,
    contract: config.cronosLockerV1.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    factory: config.cronosLockerV1.factory,
  },
  { // cronosLockerV2
    chain: config.cronosLockerV2.chain,
    contract: config.cronosLockerV2.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    factory: config.cronosLockerV2.factory,
  },
]
const polygonContractData = [
  { // Polygon Locker
    chain: config.polygonLocker.chain,
    contract: config.polygonLocker.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    factory: config.polygonLocker.factory
  },
]


const avalancheContractData = [
  { // AvaxLocker
    chain: config.avaxLocker.chain,
    contract: config.avaxLocker.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    factory: config.avaxLocker.factory
  },
  
] 


module.exports = {
  kavaContractData,
  cronosContractData,
  polygonContractData,
  avalancheContractData
}