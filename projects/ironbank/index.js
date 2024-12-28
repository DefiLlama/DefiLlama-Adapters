const { compoundExports2 } = require("../helper/compound");

module.exports = {
  start: '2020-09-08', // 09/08/2020 @ 8:00am (UTC)
  ethereum: compoundExports2({
    comptroller: '0xAB1c342C7bf5Ec5F02ADEA1c2270670bCa144CbB',
    blacklistedTokens: [
      '0x96E61422b6A9bA0e068B6c5ADd4fFaBC6a4aae27', //ibEUR
      '0x95dfdc8161832e4ff7816ac4b6367ce201538253', //ibKRW
      '0xfafdf0c4c1cb09d430bf88c75d88bb46dae09967', //ibAUD
      '0x5555f75e3d5278082200fb451d1b6ba946d8e13b', //ibJPY
      '0x1cc481ce2bd2ec7bf67d1be64d4878b16078f309', //ibCHF
      '0x69681f8fde45345c3870bcd5eaf4a05a60e7d227', //ibGBP
      '0x81d66D255D47662b6B16f3C5bbfBb15283B05BC2', //ibZAR
      '0x4e3a36A633f63aee0aB57b5054EC78867CB3C0b8', //old hacked sUSD cream market
    ]
  }),
  fantom: compoundExports2({ comptroller: '0x4250a6d3bd57455d7c6821eecb6206f507576cd2' }),
  avax: compoundExports2({ comptroller: '0x2eE80614Ccbc5e28654324a66A396458Fa5cD7Cc' }),
  optimism: compoundExports2({ comptroller: '0xE0B57FEEd45e7D908f2d0DaCd26F113Cf26715BF' }),
}
