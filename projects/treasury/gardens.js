const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  celo: {
    owners: ['0x9a17De1f0caD0c592F656410997E4B685d339029','0xd7a3D3A7dd35b8e81FC0b83C032D0ED3261417D9'],
    ownTokens: [],
    tokens: [
        nullAddress, // Native CELO
        ADDRESSES.celo.CELO, // USDC
        '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', // G
        ADDRESSES.celo.cUSD, // celoDollar
        ADDRESSES.celo.USDGLO, // USDGLO
    ], 
    fetchCoValentTokens: false,
  },
  base: {
    owners: ['0x1B8C7f06F537711A7CAf6770051A43B4F3E69A7e'],
    ownTokens: [],
    tokens: [
        nullAddress, // Native ETH
        ADDRESSES.base.USDC, // USDC
    ], 
    fetchCoValentTokens: false,
  },
  polygon: {
    owners: [
        '0x1B8C7f06F537711A7CAf6770051A43B4F3E69A7e',
    ],
    ownTokens: [],
    tokens: [
        nullAddress,// Native MATIC
        '0xc7B1807822160a8C5b6c9EaF5C584aAD0972deeC', // GIVETH
        ADDRESSES.polygon.DAI, // DAI
    ], 
    fetchCoValentTokens: false,
  },
  xdai: {
    owners: ['0x1B8C7f06F537711A7CAf6770051A43B4F3E69A7e'],
    ownTokens: [],
    tokens: [
        nullAddress, // Native XDAI
        '0xc7B1807822160a8C5b6c9EaF5C584aAD0972deeC', // GIVETH
        '0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9', // HNY
        ADDRESSES.xdai.GNO, // GNO
        ADDRESSES.xdai.WXDAI, // wXDAI
    ], 
    fetchCoValentTokens: false,
  }
})