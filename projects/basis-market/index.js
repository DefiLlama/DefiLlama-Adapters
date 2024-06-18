const {getTokenAccountBalance} = require('../helper/solana')

const basis = "Basis9oJw9j8cw53oMV7iqsgo6ihi9ALw4QR31rcjUJa";
const basis_staking = "3sBX8hj4URsiBCSRV26fEHkake295fQnM44EYKKsSs51";

async function stakingTVL(){
  const stakedBasis = await getTokenAccountBalance(basis_staking)
  return {"basis-markets": stakedBasis}
}


module.exports = {
  methodology: `TVL for basis market is staking for now`, 
  solana:{
    tvl: () => ({}),
    staking: stakingTVL//: staking(basis_staking, basis), 
  }
}