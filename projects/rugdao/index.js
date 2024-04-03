const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0x9e0eE5E4c93e300fF024518d090f98c719504560";
module.exports = ohmTvl(
    treasury, 
    [
        //MIM
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
        //USDT
        [ADDRESSES.avax.USDT_e, false],
        //USDC
        [ADDRESSES.avax.USDC_e, false],
        // RUG-MIM JLP
        ["0x8b667C1e422c08f9874709939Bc90E71c2BEA167", true]
    ], 
    "avax", "0x47953c729A571Ef331E92D537Adc45985976c756", "0xb8ef3a190b68175000b74b4160d325fd5024760e")