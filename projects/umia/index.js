// Venture 7 is UMIA, Umia's own venture. Its auction opened on 2026-08-25 and
// settled into the spot pool on 2026-09-02.
module.exports = require('../helper/umia').venture(7, {
  start: '2026-08-25',
  hallmarks: [
    ['2026-08-25', 'UMIA auction opens'],
    ['2026-09-02', 'UMIA settles, spot pool live'],
  ],
})
