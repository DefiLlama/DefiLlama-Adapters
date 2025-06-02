const { compoundExports2 } = require('../helper/compound')

module.exports = {
  hallmarks: [
    [1677133355, "MINTY distribution begins on Ethereum"],
    [1704369540, "MINTY distribution begins on Mantle"],
    [1717164347, "MINTY distribution begins on Taiko"],
    [1739973266, "MINTY distribution begins on Morph"],
  ],
}

const config = {
  ethereum: "0xD13f50274a68ABF2384C79248ADc259b3777c081",
  mantle: "0xe53a90EFd263363993A3B41Aa29f7DaBde1a932D",
  taiko: "0xe56c0d4d6A08C05ec42E923EFd06497F115D4799",
  morph: "0x121D54E653a63D90569813E7c6a4C5E6084ff7DE",
}


Object.keys(config).forEach(chain => {
  module.exports[chain] = compoundExports2({ comptroller: config[chain], })
})
