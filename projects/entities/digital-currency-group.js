const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xA401f994975E1F82170A9040e0a42D9B4256eDaf",
        "0x723B6706e3bDa84289F16b047A8b0e0936DBa59b",
        "0xFb7327DB0528cf09375081Bb2f9d9Dbd2B23FF4A",
        "0x09b2Dd967305ce5A7209243Ae865193401A985e7"
    ],
  },
}

module.exports = treasuryExports(config)