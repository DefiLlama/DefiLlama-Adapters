const { sumTokens2 } = require('../helper/unwrapLPs')

const indexManager = "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B"

const indexManagerABI = "function allIndexes() view returns (tuple(address index, bool verified)[])";
const indexABI = { lpStakingPool: "address:lpStakingPool" }
const indexABIassets = "function getAllAssets() view returns (tuple(address token, uint256 weighting, uint256 basePriceUSDX96, address c1, uint256 q1)[])"
const stakingPoolABI = { stakingToken: "address:stakingToken" }
const stakingTokenABI = {token0: "address:token0", token1: "address:token1"}

const indexTVL = async (_, __, ___, { api, chain }) => {
  //retrieve all available indexes
  const allIndexes = await api.call({  abi: indexManagerABI, target: indexManager})

  //this array contains all contracts that own TVL
  const ownersArray = [];

  //this array determines which tokens to be counted as TVL, so it doesn't count the index wrapper token itself, just the underlying value and paired token in LP
  const tokensArray = [];

  //collect all index data
  const indexStakingPools = [];

  for (const i of allIndexes) {
    //add index to owners
    ownersArray.push(i.index);
  }

  //get staking pool contract for index (spp)
  stakingPools = await api.multiCall({  abi: indexABI.lpStakingPool, calls: ownersArray});

  //get assets this index consists of
  const assetsResult = await api.multiCall({  abi: indexABIassets, calls: ownersArray});
  for(const ar of assetsResult){
    for(const asset of ar){
      //add asset to whitelisted tokens to be counted for tvl
      console.log(asset.token);
      tokensArray.push(asset.token);
    }
  }

  //get staking token for index (UNI-V2 LP)
  stakingTokens = await api.multiCall({  abi: stakingPoolABI.stakingToken, calls: stakingPools});

  //add UNI pool to owners
  ownersArray.push(...stakingTokens);

  allToken0 = await api.multiCall({  abi: stakingTokenABI.token0, calls: stakingTokens});
  allToken1 = await api.multiCall({  abi: stakingTokenABI.token1, calls: stakingTokens});

  token0 = [];
  for (const [i,value] of allToken0.entries()){
    token0[i] = value;
  }

  for (const [i,token1] of allToken1.entries()){
    //determine which token the index token is paired against and add token to whitelisted tokens to be counted for tvl
    tokensArray.push((token1 != ownersArray[i] ? token1 : token0[i]))
  }

  //remove duplicate tokens
  const uniqueTokensArray = [...new Set(tokensArray)];
  
  //blacklisting ownersArray so that all index tokens won't be counted towards TVL when added to other pods to prevent double counting
  return sumTokens2({ owners: ownersArray, tokens: tokensArray, blacklistedTokens: ownersArray})
}

module.exports = {
  ethereum: {
    tvl: indexTVL
  },
  methodology:
    "Aggregates TVL in all Peapods Finance indexes created",
};
