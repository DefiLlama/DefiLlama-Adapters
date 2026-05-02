const abi = {
    "allPools": "function allPools(uint256) view returns (address)",
    "allPoolsLength": "uint256:allPoolsLength",
    "aToken": "address:aToken",
    "poolTokensInfo": "function poolTokensInfo() view returns (address longToken, address shortToken, address sponsorToken)",
    "status": "function status() view returns (bool isShortLastRoundWinner, bool isFirstUser, bool isFirstRound, uint256 gameRound, uint256 durationOfGame, uint256 durationOfBidding, uint256 lastUpdateTimestamp, int256 initialPrice, int256 endPrice, uint8 currState)"
  };
const { pool2 } = require("../helper/pool2");

const entropyV1Factory = "0xeff87121ab94457789495918eef5a5904eb04419";
const ERP_USDC_quickswap = "0xc4bf2a012af69d44abc4bbe2b1875a222c1c32e1";
const stakingContract = "0x7ace9872ee80145ad7b4d93cf8d84d664c450ea5";
// const vesting = '0x02f1410457ceb105ca8aed71b7654fb05cb61417'
// const sponsorFarm = '0xb956B861BD97bf5195Eb4AA09d5c5EAD1B2e4514'

const tvl = async (api) => {
  // Get Entropy pool count, andd retrieve their addresses
  const pools = await api.fetchList({  lengthAbi: abi.allPoolsLength, itemAbi: abi.allPools, target: entropyV1Factory})
  
  const aTokens  = await api.multiCall({  abi: abi.aToken, calls: pools})
  return api.sumTokens({ tokensAndOwners2: [aTokens, pools], })
};

module.exports = {
  polygon: {
    tvl,
    pool2: pool2(stakingContract, ERP_USDC_quickswap,),
  },
  methodology:
    "Entropy Pools store the users collateral as aave aTokens in each pool. Quickswap LP is also staked and accounted for in pool2.",
};
