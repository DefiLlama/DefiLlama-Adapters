const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xBcd5000F5c522856E710c5d274bb672B2f2EefBf",
        "0x53c286E0AbE87c9e6d4d95ebE62ceaFa4aFCE849",
        "0xfA9b5f7fDc8AB34AAf3099889475d47febF830D7",
        "0xf286BB612e219916F8e9bA7200bF09Ed218890cb",
        "0xb283391C4B4B5C5FA20FDA38bc0178EA264682b1",
        "0xA1F5269738a227b568D1EEC42F29d71c19afeeE5",
    ],
  },
  optimism: {
    owners: [
        "0xb0e90f9Dd83aBc67268672361B4f6d54f0d7Ea2C",
        "0xea6C3Db2e7FCA00Ea9d7211a03e83f568Fc13BF7"
    ],
  },

}

module.exports = treasuryExports(config)
