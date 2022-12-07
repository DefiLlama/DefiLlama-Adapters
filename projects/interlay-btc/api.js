const { getAPI } = require('../helper/acala/api')

async function tvl(){
  const api = await getAPI('interlay');
  const interlayTVL = {}
  
  // Fetch total BTC locked (= kBTC minted)
  const tokens = await api.query.tokens.totalIssuance.entries()
  const iBTCTokenStorageKey = "0x99971b5749ac43e0235e41b0d378691857c875e4cff74148e4628f264b974c80d67c5ba80ba065480001"
  for (const t of tokens){
    if(t[0] == iBTCTokenStorageKey){
      interlayTVL.bitcoin = parseInt(t[1])/1e8
    break
    }
  }

  return interlayTVL
}


module.exports = {
  timetravel: false,
  methodology: "Tracks BTC wrapped in Interlay's interBTC bridge protocol.",
  interlay: { tvl }
};


