const { sumTokensExport } = require('../helper/unwrapLPs')

const owner = '0x571f39d351513146248AcafA9D0509319A327C4D' // vault address
const tokens = [
'0x01e0e2e61f554ecaaec0cc933e739ad90f24a86d',//GTON
'0x111111517e4929d3dcbdfa7cce55d30d4b6bc4d6',//ICHI
'0x1abaea1f7c830bd89acc67ec4af516284b1bc33c',//EUROC
'0x31429d1856ad1377a8a0079410b297e1a9e214c2',//ANGLE
'0x3cbb7f5d7499af626026e96a2f05df806f2200dc',//PANDA
'0x3fa729b4548becbad4eab6ef18413470e6d5324c',//MOVE
'0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7',//TEMPLE
'0x501ace9c35e60f03a2af4d484f49f9b1efde9f40',//SOLACE
'0x5f98805a4e8be255a32880fdec7f6728c6568ba0',//LUSD
'0x67c5870b4a41d4ebef24d2456547a03f1f3e094b',//G
'0x6b175474e89094c44da98b954eedeac495271d0f',//DAI
'0x758b4684be769e92eefea93f60dda0181ea303ec',//PHONON
'0x865377367054516e17014ccded1e7d814edc9ce4',//DOLA
'0x875773784af8135ea0ef43b5a374aad105c5d39e',//IDLE
'0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',//PNK
'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',//USDC
'0xa1d65e8fb6e87b60feccbc582f7f97804b725521',//DXD
'0xa36fdbbae3c9d55a1d67ee5821d53b50b63a1ab9',//TEMP
'0xab846fb6c81370327e784ae7cbb6d6a6af6ff4bf',//PAL
'0xbbbbbbb5aa847a2003fbc6b5c16df0bd1e725f61',//BPRO
'0xcafe001067cdef266afb7eb5a286dcfd277f3de5',//PSP
'0xd83ae04c9ed29d6d3e6bf720c71bc7beb424393e',//INSURE
'0xdac17f958d2ee523a2206206994597c13d831ec7',//USDT
'0xf5f06ffa53ad7f5914f493f16e57b56c8dd2ea80',//JELLY
]

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner, tokens })
  }
}