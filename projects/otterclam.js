const { ohmTvl } = require('./helper/ohm')

module.exports = ohmTvl(
  '0x8ce47D56EAa1299d3e06FF3E04637449fFb01C9C',
  [
    ['0xa3fa99a148fa48d14ed51d610c367c61876997f1', false],
    ['0x1581802317f32a2665005109444233ca6e3e2d68', true],
  ],
  'polygon',
  '0xC8B0243F350AA5F8B979b228fAe522DAFC61221a',
  '0xC250e9987A032ACAC293d838726C511E6E1C029d'
)
