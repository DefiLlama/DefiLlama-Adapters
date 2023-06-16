const { usdCompoundExports, compoundExports } = require('../helper/compound')


const moonbeamConfig = {
  comptroller: "0x27DC3DAdBfb40ADc677A2D5ef192d40aD7c4c97D",
  chain: "moonbeam",
  nativeTokenMarket: "0xCc444ca6bba3764Fc55BeEFe4FFA27435cF6c259",
  equivalentNativeTokenMarket: "0xAcc15dC74880C9944775448304B263D191c6077F"
}

const moonbeam = compoundExports(moonbeamConfig.comptroller, moonbeamConfig.chain, moonbeamConfig.nativeTokenMarket, moonbeamConfig.equivalentNativeTokenMarket)

module.exports = {
  moonbeam: { ...moonbeam },
}