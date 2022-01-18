const { ohmTvl } = require('../helper/ohm')

const treasury = "0x9e0eE5E4c93e300fF024518d090f98c719504560";
module.exports = ohmTvl(
    treasury, 
    [
        //MIM
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
        //USDT
        ["0xc7198437980c041c805a1edcba50c1ce5db95118", false],
        //USDC
        ["0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", false],
        // RUG-MIM JLP
        ["0x8b667C1e422c08f9874709939Bc90E71c2BEA167", true]
    ], 
    "avax", "0x47953c729A571Ef331E92D537Adc45985976c756", "0xb8ef3a190b68175000b74b4160d325fd5024760e")