const { getTvlOfSupplyAssets } = require("../matrixdock/getTvlOfSupplyAssets")

const XAGM = "0x123ffe0a3C62878dcbee2742227dc8990058d9E1"

const config = {
  ethereum: [XAGM],
}

module.exports = getTvlOfSupplyAssets(config)
