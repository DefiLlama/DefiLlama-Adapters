const { getAPI } = require('../helper/acala/api')

async function tvl(){

  const api = await getAPI('interlay');

  let voteEscrowTvl = 0
  
  // Fetch total BTC locked (= kBTC minted)
  const stakers = await api.query.escrow.locked.entries()

  for (const staker of stakers) {
    voteEscrowTvl += parseInt(staker[1].amount) / 1e10
  }
  return {
    "interlay": voteEscrowTvl
  }
}


module.exports = {
  timetravel: false,
  methodology: "Tracks INTR vote-escrowed in Interlay. Vote escrowed INTR remain locked until the unlock date, min. 1 week, max 192 weeks.",
  interlay: { tvl }
};


