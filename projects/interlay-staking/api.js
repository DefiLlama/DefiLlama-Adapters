
const { ApiPromise, WsProvider } = require("@polkadot/api")

const endpoint = "wss://api.interlay.io:443/parachain"

async function tvl(){

  const provider = new WsProvider(endpoint);
  const api = await ApiPromise.create(({ provider }));

  voteEscrowTvl = 0
  
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


