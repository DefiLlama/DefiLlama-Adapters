// Venture 7 is UMIA, Umia's own venture. Its auction settled into the spot pool
// on 2026-09-02.
module.exports = require('../helper/umia').venture(7, {
  start: '2026-09-02',
  hallmarks: [['2026-09-02', 'UMIA settles, spot pool live']],
})
