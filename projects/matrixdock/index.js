const {getTvlOfSupplyAssets} = require("./getTvlOfSupplyAssets")

const config = {
  ethereum: ['0x530824DA86689C9C17CdC2871Ff29B058345b44a'],
}

module.exports = getTvlOfSupplyAssets(config)