const { getUniTVL } = require('./helper/unknownTokens');

module.exports = {
  ronin: { tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xb255d6a720bb7c39fee173ce22113397119cb930', }) },
  hallmarks:[
    ['2022-05-28', "Ronin Bridge Hack $625m"],
  ],
}
