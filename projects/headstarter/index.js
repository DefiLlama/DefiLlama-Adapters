const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const STAKING_CONTRACT = "0x000000000000000000000000000000000070eac5";
const HST = ADDRESSES.hedera.HST;

const ENTITIES = [
  {
    token: "0x000000000000000000000000000000000048fda4",
    contracts: [
      "0x00000000000000000000000000000000004e3387",
      "0x00000000000000000000000000000000004e3395",
      "0x00000000000000000000000000000000004d6daa",
      "0x0000000000000000000000000000000000575c04",
    ],
  },
  {
    token: ADDRESSES.hedera.STEAM,
    contracts: [
      "0x00000000000000000000000000000000005737f0",
      "0x00000000000000000000000000000000005737e1",
      "0x0000000000000000000000000000000000571a8d",
      "0x0000000000000000000000000000000000571a8a",
      "0x000000000000000000000000000000000056d9ea",
      "0x0000000000000000000000000000000000575c04",
    ],
  },
  {
    token: ADDRESSES.hedera.HLQT,
    contracts: [
      "0x00000000000000000000000000000000005cb45b",
      "0x00000000000000000000000000000000005cb45f",
      "0x0000000000000000000000000000000000575c04",
    ],
  },
  {
    token: HST,
    contracts: [
      "0x00000000000000000000000000000000000f5ad1",
      "0x00000000000000000000000000000000000fc16c", 
      "0x0000000000000000000000000000000000101201",
      "0x0000000000000000000000000000000000575c04",
    ],
  },
];

const getTokensAndOwners = (entities) => {
  return entities.map(({ token, contracts}) => contracts.map(i => [token, i])).flat();
};

const tvl = async (api) => {
  const tokensAndOwners = getTokensAndOwners(ENTITIES);
  return sumTokens2({api, tokensAndOwners });
};

const staking = async (api) => {
  const poolCounter = await api.call({
    abi: 'uint256:poolCounter',
    target: STAKING_CONTRACT
  });
  
  let totalStaked = 0;
  
  // Query each pool to get totalDeposit
  for (let i = 0; i < poolCounter; i++) {
    const poolInfo = await api.call({
      abi: 'function getPoolInfo(uint256) view returns (uint256 rate, uint256 totalDeposit, uint256 startDate, uint256 endDate, uint256 lockPeriodInDays, uint256 hardCap, uint256 lastUpdateTime, uint256 rewardBalance, uint256 penaltyRate)',
      target: STAKING_CONTRACT,
      params: [i]
    });
    
    totalStaked += Number(poolInfo.totalDeposit);
  }
  
  // Add the totalStaked HST tokens to the result
  api.add(HST, totalStaked);
  
  return api.getBalances();
};

module.exports = {
  methodology: "We count the HST tokens locked in the HeadStarter contracts.",
  hedera: {
    tvl,
    staking,
  },
};
