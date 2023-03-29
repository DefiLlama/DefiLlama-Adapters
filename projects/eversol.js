const {getTokenSupply} = require('./helper/solana')

async function tvl(){
  const supply = await getTokenSupply("Hg35Vd8K3BS2pLB3xwC2WqQV8pmpCm3oNRGYP1PEpmCM");

  return {
    'Eversol-Staked-SOL': supply
  }
}

module.exports={
  timetravel: false,
  methodology: "ESOL total supply as it's equal to the SOL staked",
  solana:{
    tvl
  }
}
