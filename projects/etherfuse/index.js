const solana = require('../helper/solana');
const { sumTokens2, } = require('../helper/unwrapLPs');


async function solanaTvl() {
  return solana.sumTokens2({ owner: '2cbUAqNoySYkG5R7edjm1WLXgtty6PeCRDVJ7zZbodQm' })
}
module.exports = {
  methodology: "All tokens locked in WavesBridge smart contracts.",
  timetravel: false,  solana: {
    tvl: solanaTvl,
  },
}

