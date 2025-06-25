const { sumTokens2, } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ owner: 'ALfS4oPB5684XwTvCjWw7XddFfmyTNdcY7xHxbh2Ui8s'})
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
}