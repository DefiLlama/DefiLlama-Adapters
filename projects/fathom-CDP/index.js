const Vaults = [
    '0x9B4aCeFE2dB986Ca080Dc01d137e6566dBE0aA3a', // CDP Vault CollateralPoolId "0x5844430000000000000000000000000000000000000000000000000000000000" XDC
    '0x14F2d15cdB7255A7c96973Ce54a269Ac1988cfcf' // CDP Vault CollateralPoolId "0x43474f0000000000000000000000000000000000000000000000000000000000" CGO
];
const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {  
  xdc: { tvl: sumTokensExport({ owners: Vaults, tokens: [ADDRESSES.xdc.WXDC, '0x8f9920283470f52128bf11b0c14e798be704fd15']}) },
}
