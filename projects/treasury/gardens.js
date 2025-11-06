const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  celo: {
    owners: ['0x9a17De1f0caD0c592F656410997E4B685d339029','0xd7a3D3A7dd35b8e81FC0b83C032D0ED3261417D9'],
    ownTokens: [],
    tokens: [
        nullAddress, // Native CELO
        '0x471EcE3750Da237f93B8E339c536989b8978a438', // USDC
        '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', // G
        '0x765DE816845861e75A25fCA122bb6898B8B1282a', // celoDollar
        '0x4F604735c1cF31399C6E711D5962b2B3E0225AD3', // USDGLO
    ], 
    fetchCoValentTokens: false,
  },
  base: {
    owners: ['0x1B8C7f06F537711A7CAf6770051A43B4F3E69A7e'],
    ownTokens: [],
    tokens: [
        nullAddress, // Native ETH
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
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
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
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
        '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', // GNO
        '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // wXDAI
    ], 
    fetchCoValentTokens: false,
  }
})