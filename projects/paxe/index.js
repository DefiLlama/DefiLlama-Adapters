const { staking } = require("../helper/staking")


const PAXE = "0xbA576f5ecbA5182a20f010089107dFb00502241f"
const SAKAI = "0x43b35e89d15b91162dea1c51133c4c93bdd1c4af"
const PAXE_FARMING_CONTRACT = '0xbA576f5ecbA5182a20f010089107dFb00502241f';
const RESTAKING_POOL = '0x269e1ceb128ccCD5684BbAFF9906D69eD1e9e9C8';

const TOKEN_CONTRACTS = [
     PAXE,SAKAI
]

module.exports = {
  bsc: {
             tvl: sumTokensExport({ 
          owner: PAXE_FARMING_CONTRACT , 
                   restake: RESTAKING_POOL,
          
        }),
            
  },
}