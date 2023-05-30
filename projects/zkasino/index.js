const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/unwrapLPs')

// https://docs.zkasino.io/developer/contracts
const owners = [
  '0x51e99A0D09EeCa8d7EFEc3062AC024B6d0989959',
  '0x0A112b111eb22D1cc0AF42fF68398A55e0B69A16',
  '0x6AcB199B7C8C67832F516f70D25fcD9d6db0Ae9d',
  '0x34433F8fE4D2acbF9e1E0EDb3284679FEE4ff4B5',
  '0x8696a4418D4182D0F97CE11F4536905Df00792C2',
  '0x178c1D16A434DC76fE45e121b6e7872de21E4263',
  '0x89Ecd415f6cFDb72e276ebD2D2bADD984B06d2A8',
  '0x1B1b637B64820637BB42c5803813Dc2ecC5DF5C4',
]

const config = {
  bsc: {
    tokens: [ADDRESSES.bsc.BUSD, nullAddress,]
  },
  polygon: {
    tokens: [ADDRESSES.polygon.USDC, nullAddress,]
  },
  fantom: {
    tokens: [ADDRESSES.fantom.USDC, nullAddress,]
  },
  arbitrum: {
    tokens: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC, '0xADA42bb73b42e0472A994218fb3799dFCDA21237', '0x912CE59144191C1204E64559FE8253a0e49E6548', nullAddress,]
  }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { tokens } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens })
  }
})
