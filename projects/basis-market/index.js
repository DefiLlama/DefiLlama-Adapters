const {sumTokens2} = require('../helper/solana')

const basis_staking = "3sBX8hj4URsiBCSRV26fEHkake295fQnM44EYKKsSs51";

async function stakingTVL(){
  return sumTokens2({tokenAccounts: [basis_staking]})
}

module.exports = {
  methodology: `TVL for basis market is staking for now`, 
  solana:{
    tvl: () => ({}),
    staking: stakingTVL//: staking(basis_staking, basis), 
  }
}