const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: function tvl(_, _b, _cb, { api, }) {
      const owner = '0x0f41eAdEc8FA71787516CCC5CEAcBD6430848f9E'
      return sumTokens2({ api, owner, resolveUniV3: true })
    }
  }
};
