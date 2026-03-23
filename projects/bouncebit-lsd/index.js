const ADDRESSES = require('../helper/coreAssets.json')

const STAKE_ABI = {
  stakingToken: "function stakingToken() view returns (address)"
}

const stakeContracts = [
  '0xE031b9E9AA6Ec7F29362cBD4735Ef567215fc68A',
  '0xbF28516EB2a987CB63b1E3b019fEb42aA40d5577',
  '0x9e4c010d537551c2FF5dEA9A73Af189Dfb9347E6',
  '0x44398B640c82821eF354707598C4C148d81aE72a',
  '0x3b457C670711e0771a8Da4f2589d7d8DbA3D40A0'
]

async function bouncebitLSD(api) {
  const BBBalance = await api.call({  abi: 'erc20:totalSupply', target: '0x22aAC17E571D6651880d057e310703fF4C7c3483'})  
  api.add(ADDRESSES.null, BBBalance)

  const utokens = await api.multiCall({ calls: stakeContracts, abi: STAKE_ABI.stakingToken})
  const toa = utokens.map((addr, idx)=> [addr, stakeContracts[idx]])
  return api.sumTokens({ tokensAndOwners: toa })
}

module.exports = {
  bouncebit: {
    tvl: ()=> {},
    staking: bouncebitLSD
  }
};
