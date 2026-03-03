const { uniTvlExport } = require("../helper/calculateUniTvl");
const { staking } = require("../helper/staking");

const factory = "0x570aA1E0aa3d679Bc9DaAA47564ed3Daba1208FE";
const casino = "0x95ac4a86c0677971c4125ACe494e3C17a87a4C61";
const xcasino = "0x2c7e38eeB92F5402A6B43520a4d92F0fe4Cad1B1";


module.exports = {
  harmony: {
    tvl: uniTvlExport(factory, 'harmony'),
    staking: staking(xcasino, casino, "harmony")
  }
}