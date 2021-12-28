const { ohmTvl } = require('../helper/ohm')

const treasury = "0x2F87A9550f19666cEF5De29c5F613966cf164BE6"
module.exports = ohmTvl(
    treasury, 
    [
        //MIM
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
        //BENQI
        ["0x8729438eb15e2c8b576fcc6aecda6a148776c0f5", false],
        //WAVAX
        ["0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", false],
        //DAI
        ["0xd586e7f844cea2f87f50152665bcbc2c279d8d70", false],
        //JOELP
        ["0x8b667c1e422c08f9874709939bc90e71c2bea167", true],
        //JOELP
        ["0xaef4b048a500140be5f612d43f1bc13dfc987b30", true],
        //JOELP
        ["0xc0123c360f000338ce3b54b600697f3584054bc1", true],
    ], 
    "avax", "0x47953c729A571Ef331E92D537Adc45985976c756", "0xb8ef3a190b68175000b74b4160d325fd5024760e")