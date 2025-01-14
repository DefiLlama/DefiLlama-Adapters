const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  era: {
    OT: '0xD0eA21ba66B67bE636De1EC4bd9696EB8C61e9AA',
    OSD: '0x2F96F4397AdDdF9C2eeB5233a29556BE26eb9450',
    OETH: '0x9D8A2817eb7137021E2F1A86316a7E3A3351b4e0',
    swapContracts: ['0x84c18204c30da662562b7a2c79397C9E05f942f0', '0x2a98158166BE71D21Dd97e248ba670211Df9a73C'],
    futureContracts: ['0x57D28e11Cb2f72812A9f9DA72F2Ff868cd4B43F2'],
  },
  base: {
    swapContracts: ['0xdDc8Bd03c1AB16a3E3dB0E89AA32C238FB9d63de'],
    OSD: '0x139f18aC2a9FA34E0225FD2AAE983fc969b35540',
    OETH: '0x2a86F14E762622Da8B7FB2A5BBdE50E16936279f',
    futureContracts: [],
  }
}

Object.keys(config).forEach(chain => {
  const { OSD, OETH, swapContracts, futureContracts } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = (await api.multiCall({ abi: 'address[]:getPoolTokenList', calls: swapContracts })).flat()
      return api.sumTokens({
        tokensAndOwners: [[ADDRESSES.null, OETH]],
        tokens, owners: [swapContracts, futureContracts].flat(),
        blacklistedTokens: [OSD, OETH],
      })
    }
  }
})