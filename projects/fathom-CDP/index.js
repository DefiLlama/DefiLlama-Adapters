const WXDCHolders = [
    '0x9B4aCeFE2dB986Ca080Dc01d137e6566dBE0aA3a', // CDP Vault CollateralPoolId "0x5844430000000000000000000000000000000000000000000000000000000000"
];
const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {  
  xdc: { tvl: sumTokensExport({ owners: WXDCHolders, tokens: [ADDRESSES.xdc.WXDC]}) },
}
