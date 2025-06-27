const {getTvlOfSupplyAssets} = require("../matrixdock/getTvlOfSupplyAssets")

const config = {
  ethereum: ['0x2103E845C5E135493Bb6c2A4f0B8651956eA8682'],
  bsc: ['0x23AE4fd8E7844cdBc97775496eBd0E8248656028']
}

module.exports = getTvlOfSupplyAssets(config)