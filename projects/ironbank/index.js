const { getCompoundV2Tvl, compoundExports, usdCompoundExports } = require("../helper/compound");



const ftmSFIreplace =  addr=> addr==="0x924828a9Fb17d47D0eb64b57271D10706699Ff11" ? "0xb753428af26e81097e7fd17f40c88aaa3e04902c":`fantom:${addr}`
module.exports = {
  start: 1599552000, // 09/08/2020 @ 8:00am (UTC)
  ethereum: compoundExports("0xAB1c342C7bf5Ec5F02ADEA1c2270670bCa144CbB", "ethereum",undefined,undefined,undefined,undefined,{
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
  fantom: {
    tvl: getCompoundV2Tvl("0x4250a6d3bd57455d7c6821eecb6206f507576cd2", "fantom", ftmSFIreplace, undefined, undefined, false),
    borrowed: getCompoundV2Tvl("0x4250a6d3bd57455d7c6821eecb6206f507576cd2", "fantom", ftmSFIreplace, undefined, undefined, true)
  },
  avax:compoundExports("0x2eE80614Ccbc5e28654324a66A396458Fa5cD7Cc", "avax"),
  optimism: compoundExports("0xE0B57FEEd45e7D908f2d0DaCd26F113Cf26715BF", "optimism")
};
