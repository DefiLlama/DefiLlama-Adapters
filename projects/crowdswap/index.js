const {sumTokensExport,sumLPWithOnlyOneToken } = require("../helper/unwrapLPs");
const farms = require('./farms');
const polygonStakingContracts = '0x3C868fe859eF46a133e032f22B443e6Efd617449';

const bscStakingContracts = '0x21224834612ecaC194c4b877b49e7794f193d2A2';

const CROWD = "0x483dd3425278C1f79F377f1034d9d2CaE55648B6";
const BscCROWD = "0xA5d4B64a639d93b660cdA04D331374dA1108F8f5";


async function tvl(chain, block) {
  let balances ={};
  
  let transform;

  for(let i =0; i < farms.length; i++){
    if(chain === farms[i].chain){
    transform = addr => chain+":"+addr
    await sumLPWithOnlyOneToken(balances, farms[i].LpToken, farms[i].stakeContract, farms[i].tokenB.address, block, chain, transform)}
}

return balances;
}

const chains = [
  'polygon',
  'bsc',
  'arbitrum'
]

// module.exports = {
// };
chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => tvl(chain, block)
  }
})

module.exports.polygon.staking = sumTokensExport({ owner: polygonStakingContracts, tokens: [CROWD] })
module.exports.bsc.staking = sumTokensExport({ owner: bscStakingContracts, tokens: [BscCROWD] })
