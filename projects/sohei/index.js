const {compoundExports} = require('../helper/compound');
const { nullAddress } = require('../helper/tokenMapping');

const ceth = "0x685d1f1a83ff64e75fe882e7818e4ad9173342ca";



module.exports = {
  hallmarks: [
    [1680480000, "Team out of funds announced"]
  ],
  deadFrom: '2023-04-20',
  arbitrum: compoundExports('0x9f750cf10034f3d7a18221aec0bddab7fc6f32ba', ceth, nullAddress, { blacklistedTokens: ['0x6e002cb9bf8c17409eeb6c593ef6548faddd2985']}),
}

module.exports.arbitrum.borrowed = () => ({}) // bad debt