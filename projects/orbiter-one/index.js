const { compoundExports2 } = require('../helper/compound')

const moonbeamConfig = {
  comptroller: "0x27DC3DAdBfb40ADc677A2D5ef192d40aD7c4c97D",
  cether: "0xCc444ca6bba3764Fc55BeEFe4FFA27435cF6c259",
  fetchBalances: true,
}

module.exports = {
  moonbeam: compoundExports2(moonbeamConfig)
}