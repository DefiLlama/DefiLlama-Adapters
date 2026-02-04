const ADDRESSES = require('./helper/coreAssets.json');
const { staking } = require('./helper/staking');

const tokens = [
  ADDRESSES.polygon.WMATIC_2,
  ADDRESSES.polygon.WETH_1,
  ADDRESSES.polygon.USDT,
  '0x831753dd7087cac61ab5644b308642cc1c33dc13', //QUICK
];
const fundedContracts = [
  '0x3C58EA8D37f4fc6882F678f822E383Df39260937', //masterchef
  '0xc7F4F97E710C2d87F29f6F03220a3425064e02E5', //prize
  '0xa3541eA15556AD3272b9BDe36241F61cCbb60aE8', //staking pool
  '0x6A974e96a963e9f219915797C4E3B9e2A63ab0e2', //roll
  '0xC96D9032770010f5f3D167cA4eeca84a0Bca0Fa2'  //miner
]

module.exports = {
  polygon: {
    tvl: staking(fundedContracts, tokens),
    staking: staking(fundedContracts, '0xc68e83a305b0fad69e264a1769a0a070f190d2d6')
  }
}