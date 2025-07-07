const { sumTokensExport } = require("../helper/unwrapLPs");

const abi = {
  "factorySettings": "function factorySettings() view returns (address asset, address assetPriceFeed, address rankToken, address ranktokenPricePair, address backendAddress, address managedAddress, address rankStakingPool, uint256 rankStakingPoolId, uint256 premiumStakingValue, tuple(uint16 depositFeeBP, uint16 performanceFeeBP, uint16 ownerDepositFeeBP), uint256 MAX_DURATION, bool enabled)",
  "rankStrategiesCount": "function () view returns (uint256)",
  "rankStrategies": "function (uint256) view returns (address)",
  "totals": "function totals() view returns (uint256 shares, uint256 assetAmount, uint256 withdrawableAssetAmount, uint256 lastAvailUpdate)",
  "poolInfo": "function poolInfo(uint256) view returns (address stakingToken, address rewardToken, uint256 lastRewardTimestamp, uint256 accTokenPerShare, uint256 startTime, uint256 endTime, uint256 precision, uint256 totalStaked, uint256 totalReward, address owner)"
}


const rankTokenAddress = "0x978aB3D5A5C39bCBb2a15f2ad324187dD7cBf952";

const rankFactoryContracts = [
  "0x6E9d30690E433503d3dB7001610f60290a286a3f",
  "0x7cD6ead7e0834Ae8bc393bA4c933Bb9e80e7dC19"
];

const stakingContracts = [{ poolAddress: "0xd6A07b8065f9e8386A9a5bBA6A754a10A9CD1074", poolId: 380 }];
const vestingContracts = ["0x582c5ae03f55a3eb5e79f8d3e2cf9712c331a3b0", "0xd2b1c19dc746331829918fe3517a40935ebb53f0", "0xd041c5d24491dff050f40fab5d485530ebe441c2"];

async function tvl(api) {
  const factorySettings = await api.multiCall({ abi: abi.factorySettings, calls: rankFactoryContracts, });
  const tokens = factorySettings.map((f) => f.asset);

  for (let i = 0; i < rankFactoryContracts.length; i++) {
    const strategies = await api.fetchList({ lengthAbi: 'rankStrategiesCount', itemAbi: 'rankStrategies', target: rankFactoryContracts[i], })
    const totals = await api.multiCall({ abi: abi.totals, calls: strategies })
    api.add(tokens[i], totals.map(i => i.assetAmount))
  }
}

async function staking(api) {
  for (let stakingContract of stakingContracts) {
    const { poolAddress, poolId } = stakingContract;
    const stake = await api.call({ abi: abi.poolInfo, target: poolAddress, params: poolId, });
    api.add(stake.stakingToken, stake.totalStaked);
  }
}

module.exports = {
  methodology: "TVL = Sum of all assets locked in Rank Trading contracts, Staking = Total $RAN staked in the Staking Pools, Vesting = Total $RAN in vesting contracts, Liquidity = Total locked liquidity in V3 pools",
  bsc: {
    tvl,
    staking,
    vesting: sumTokensExport({ owners: vestingContracts, tokens: [rankTokenAddress], }),
    // pool2, // this is locked in UNCX network? we cant treat it as your pool2 https://bscscan.com/address/0xfe88DAB083964C56429baa01F37eC2265AbF1557
  },
};
