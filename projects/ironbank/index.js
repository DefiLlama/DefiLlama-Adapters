const { getCompoundV2Tvl, compoundExports, usdCompoundExports } = require("../helper/compound");

const ftmSFIreplace =  addr=> addr==="0x924828a9Fb17d47D0eb64b57271D10706699Ff11" ? "0xb753428af26e81097e7fd17f40c88aaa3e04902c":`fantom:${addr}`
module.exports = {
  start: 1599552000, // 09/08/2020 @ 8:00am (UTC)
  ethereum: usdCompoundExports("0xAB1c342C7bf5Ec5F02ADEA1c2270670bCa144CbB", "ethereum"),
  fantom: {
    tvl: getCompoundV2Tvl("0x4250a6d3bd57455d7c6821eecb6206f507576cd2", "fantom", ftmSFIreplace, undefined, undefined, false),
    borrowed: getCompoundV2Tvl("0x4250a6d3bd57455d7c6821eecb6206f507576cd2", "fantom", ftmSFIreplace, undefined, undefined, true)
  },
  avalanche:compoundExports("0x2eE80614Ccbc5e28654324a66A396458Fa5cD7Cc", "avax"),
};
