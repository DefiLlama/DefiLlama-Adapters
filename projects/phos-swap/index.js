const { uniTvlExport } = require('../helper/unknownTokens')

const FACTORY = '0xde4e7629Dc3eb7517774866D9ced192F26AF4Da6'

module.exports = {
  ...uniTvlExport('xp', FACTORY),
  methodology:
    'Sums the reserves of every pair the Phos swap factory has created on Xphere. Native XP is held as wXP. A pair whose other side is a launch token is valued at twice its wXP reserve, since that side has no price.',
  start: '2026-09-14',
}
