const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xA8C6F6e2dFbDeDEDD157a5363D38d7d074d83985",
        "0x5Bc5ec5130f66f13d5C21ac6811A7e624ED3C7c6",
        "0x8962285fAac45a7CBc75380c484523Bb7c32d429"
    ],
  },
  avax: {
    owners: [
        "0xA8C6F6e2dFbDeDEDD157a5363D38d7d074d83985",
    ],
  },
  optimism: {
    owners: [
        "0xA8C6F6e2dFbDeDEDD157a5363D38d7d074d83985",
    ],
  },
  linea: {
    owners: [
        "0x8962285fAac45a7CBc75380c484523Bb7c32d429",
    ],
  },
  era: {
    owners: [
        "0x8962285fAac45a7CBc75380c484523Bb7c32d429",
    ],
  },
  polygon: {
    owners: [
        "0x8962285fAac45a7CBc75380c484523Bb7c32d429",
    ],
  },
}

module.exports = treasuryExports(config)