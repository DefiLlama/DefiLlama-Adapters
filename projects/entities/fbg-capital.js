const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xe25397734a184053cF382E5C4e32cA7eF8335F31",
        "0x7c04A698855d1ECF9610636a1d7AFf8E03331fa5",
        "0xb079F40dd951d842f688275100524c09bEf9b4E2",
        "0x6d51fDc0C57CBBFf6DAC4a565B35a17b88c6CEB5"
    ],
  },
  avax: {
    owners: [
        "0xe25397734a184053cF382E5C4e32cA7eF8335F31"
    ],
  },
  bsc: {
    owners: [
        "0x6d51fDc0C57CBBFf6DAC4a565B35a17b88c6CEB5"
    ],
  },
  polygon: {
    owners: [
        "0xe25397734a184053cF382E5C4e32cA7eF8335F31"
    ],
  },
}

module.exports = treasuryExports(config)