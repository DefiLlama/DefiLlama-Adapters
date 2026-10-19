const { lending } = require('../helper/acala/lending')

module.exports = {
  hallmarks: [
    ['2022-08-15', "aUSD exploit"]
  ],
  timetravel: false,
  misrepresentedTokens: true,
  acala: { tvl: () => lending('acala') },
}
