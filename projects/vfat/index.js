const { getLogs } = require('../helper/cache/getLogs');
const { get } = require('../helper/http');
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs');

const config = require('./config');
const { sumLPBalances, filteredV3LPTokens } = require('./utils');

// Helper function to fetch sickles
async function fetchSickles(api, factory, fromBlockSickle) {
  const deployLogs = await getLogs({
    api,
    target: factory,
    fromBlock: fromBlockSickle,
    eventAbi: 'event Deploy(address indexed admin, address sickle)',
    onlyArgs: true,
  });
  return deployLogs.map(log => log.sickle);
}

// Helper function to fetch and process gauges
async function fetchGauges(api, voter, fromBlock, gaugeFactory, gaugeFactory2, includeOldContract = false, oldGaugeFactory2 = '') {
  const deployAeroLogs = await getLogs({
    api,
    target: voter,
    fromBlock,
    eventAbi: `event GaugeCreated(
                address indexed poolFactory,
                address indexed votingRewardsFactory,
                address indexed gaugeFactory,
                address pool,
                address bribeVotingReward,
                address feeVotingReward,
                address gauge,
                address creator
            )`,
  });

  return deployAeroLogs.reduce(
    (acc, log) => {
      const gaugeFactoryAddress = log.args.gaugeFactory;
      const gaugeAddress = log.args.gauge;
      if (gaugeFactoryAddress === gaugeFactory) {
        acc.lp.push(gaugeAddress);
      } else if (gaugeFactoryAddress === gaugeFactory2 || (includeOldContract && gaugeFactoryAddress === oldGaugeFactory2)) {
        acc.nft.push(gaugeAddress);
      }
      return acc;
    },
    { lp: [], nft: [] }
  );
}


async function fetchGauges2(api, fromBlock, gaugeFactory, gaugeFactory2, voter, chainName) {
  const eventAbi = `event GaugeCreated(
    address indexed gauge,
    address creator,
    address feeDistributor,
    address indexed pool
  )`;

  const eventAbi2 = `event GaugeCreated(address indexed pool, address gauge)`;

  const deployRamsesLogs = await getLogs({
    api,
    target: chainName === 'linea' ? voter : gaugeFactory,
    fromBlock,
    eventAbi,
    skipCache: true,
  });

  const deployRamsesLogs2 = await getLogs({
    api,
    target: gaugeFactory2,
    fromBlock,
    eventAbi: eventAbi2,
    skipCache: true,
  });

  const lp = deployRamsesLogs.map(log => log.args.gauge);
  const nft = deployRamsesLogs2.map(log => log.args.gauge);

  const nftSet = new Set(nft);

  const filteredLp = lp.filter(address => !nftSet.has(address));

  return { lp: filteredLp, nft };
}

async function fetchSickleNftPositions(api, sickles, managerAddress, isMasterchef = false) {
  const nftCalls = [];

  const sickleBals = await api.multiCall({ abi: 'erc20:balanceOf', target: managerAddress, calls: sickles });
  for (let i = 0; i < sickles.length; i++) {
    const sickle = sickles[i]
    let nftBals = +sickleBals[i];
    for (let j = 0; j < nftBals; j++)
      nftCalls.push({ params: [sickle, j] });

  }

  const nftIds = await api.multiCall({ abi: 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)', calls: nftCalls, target: managerAddress });

  const positions = await api.multiCall({
    abi: isMasterchef
      ? 'function userPositionInfos(uint256 tokenId) view returns (uint128 liquidity, uint128 boostLiquidity, int24 tickLower, int24 tickUpper, uint256 rewardGrowthInside, uint256 reward, address user, uint256 pid, uint256 boostMultiplier)'
      : 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
    calls: nftIds,
    target: managerAddress,
  });

  const pidSet = new Set(positions.map(position => position.pid));
  const pids = [...pidSet];

  if (isMasterchef) {
    const poolInfos = await api.multiCall({
      abi: 'function poolInfo(uint256 pid) view returns (uint256 allocPoint, address v3Pool, address token0, address token1, uint24 fee, uint256 totalLiquidity, uint256 totalBoostLiquidity)',
      calls: pids,
      permitFailure: true,
      target: managerAddress,
    });
    const poolInfoMap = {};
    poolInfos.forEach((info, index) => {
      poolInfoMap[pids[index]] = info;
    });

    positions.forEach((position) => {
      if (!position) return;
      const poolInfo = poolInfoMap[position.pid];
      if (!poolInfo) {
        console.log('Missing pool info for pid', position.pid, position, managerAddress)
      }
      position.allocPoint = poolInfo.allocPoint;
      position.v3Pool = poolInfo.v3Pool;
      position.token0 = poolInfo.token0;
      position.token1 = poolInfo.token1;
      position.fee = poolInfo.fee;
      position.totalLiquidity = poolInfo.totalLiquidity;
      position.totalBoostLiquidity = poolInfo.totalBoostLiquidity;
    });
  }

  return positions.filter(position => position).forEach(position => {
    addUniV3LikePosition({ ...position, api })
  })
}

async function fetchGauges3(api, voter, fromBlock) {
  const eventAbi = `event StakingRewardsCreated(
    address indexed pool,
    address indexed stakingRewards,
    address indexed rewardToken,
    address stakingToken
  )`;

  const deployLogs = await getLogs({
    api,
    target: voter,
    fromBlock,
    eventAbi,
    skipCache: true,
  });

  return deployLogs.map(log => log.args[2]);
}

// TVL calculation for Base and Optimism
async function tvlBaseOptimism(api) {
  const { factory, gaugeFactory, gaugeFactory2, oldGaugeFactory2, voter, NonfungiblePositionManager, oldNonfungiblePositionManager, fromBlock, fromBlockSickle, chainName } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);
  const includeOldContract = chainName === 'optimism';
  const deployedAeroGauges = await fetchGauges(api, voter, fromBlock, gaugeFactory, gaugeFactory2, includeOldContract, oldGaugeFactory2);

  const stakingTokens = await api.multiCall({ abi: 'address:stakingToken', calls: deployedAeroGauges.lp });
  await sumLPBalances(api, deployedAeroGauges.lp, sickles, stakingTokens);

  const pools = await api.multiCall({ abi: 'address:pool', calls: deployedAeroGauges.nft });
  const whitelistedPoolList = new Set(await filteredV3LPTokens({ api, lpTokens: pools, minLPValue: 50e3 }));
  const slot0s = await api.multiCall({ abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)', calls: pools });

  await Promise.all(deployedAeroGauges.nft.map(async (gauge, i) => {
    if (!whitelistedPoolList.has(pools[i])) return;
    const tick = slot0s[i].tick;
    const nftIds = (await api.multiCall({ abi: 'function stakedValues(address depositor) view returns (uint256[])', calls: sickles, target: gauge })).flat();
    const positions = await api.multiCall({ abi: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)', calls: nftIds, target: NonfungiblePositionManager, permitFailure: true, });
    if (chainName === 'optimism' && oldNonfungiblePositionManager) {
      const oldPositions = await api.multiCall({ abi: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)', calls: nftIds, target: oldNonfungiblePositionManager, permitFailure: true, });
      positions.push(...oldPositions);
    }
    positions.filter(i => i).forEach(position => addUniV3LikePosition({ ...position, tick, api }));
  }));

  if (chainName === 'base')
    await fetchSickleNftPositions(api, sickles, config[api.chain].masterchefV3, true);

  return sumTokens2({ api, resolveLP: true });
}

// TVL calculation for Arbitrum and Linea
async function tvlArbitrumLinea(api) {
  const { factory, gaugeFactory, gaugeFactory2, voter, fromBlock, fromBlockSickle, chainName } = config[api.chain];
  const blacklistedSickles = ['0x4989D5e508eBa5D4999b6A34FB30021e1f1bB4d8'];
  let sickles = await fetchSickles(api, factory, fromBlockSickle);
  if (chainName === 'linea') {
    sickles = sickles.filter(sickle => !blacklistedSickles.includes(sickle));
  }
  const gauges = await fetchGauges2(api, fromBlock, gaugeFactory, gaugeFactory2, voter, chainName);
  const stakingTokens = await api.multiCall({ abi: 'address:stake', calls: gauges.lp });

  await sumLPBalances(api, gauges.lp, sickles, stakingTokens);
  await fetchSickleNftPositions(api, sickles, config[api.chain].NonfungiblePositionManager);
  await fetchSickleNftPositions(api, sickles, config[api.chain].masterchefV3, true);

  api.removeTokenBalance('0xe80772eaf6e2e18b651f160bc9158b2a5cafca65')
  return sumTokens2({ api, resolveLP: true });
}

async function modeTvl(api) {
  const { factory, voter, fromBlock, fromBlockSickle, chainName } = config[api.chain];
  const sickles = await fetchSickles(api, factory, fromBlockSickle);
  const gauges = await fetchGauges3(api, voter, fromBlock);
  const stakingTokens = await api.multiCall({ abi: 'address:stakingToken', calls: gauges });
  await sumLPBalances(api, gauges, sickles, stakingTokens);
  return sumTokens2({ api, resolveLP: true });
}

// TVL calculation for chains with masterchefV3
async function genericTvl(api) {
  const { factory, fromBlockSickle, masterchefV3, NonfungiblePositionManager, chainName } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);

  if (masterchefV3)
    await fetchSickleNftPositions(api, sickles, masterchefV3, true);


  if (NonfungiblePositionManager)
    await fetchSickleNftPositions(api, sickles, NonfungiblePositionManager);

}

async function fetchFantomGauges(api, fromBlock, gaugeFactory) {
  const eventAbi = `event GaugeCreated(
    address indexed maker,
    address indexed pool,
    address g,
    address b,
    address v,
    bool i,
    address[] a
  )`;

  const deployLogs = await getLogs({
    api,
    target: gaugeFactory,
    fromBlock,
    eventAbi,
    onlyArgs: true,
  });

  return deployLogs.map(log => log.g);
}

// TVL calculation for Fantom
async function tvlFantom(api) {
  const { factory, gaugeFactory, voter, fromBlock, fromBlockSickle, chainName } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);
  const gauges = await fetchFantomGauges(api, fromBlock, gaugeFactory, voter, chainName);
  const stakingTokens = await api.multiCall({ abi: 'address:stake', calls: gauges });
  await sumLPBalances(api, gauges, sickles, stakingTokens);

  return sumTokens2({ api, resolveLP: true });
}

async function tvlMantle(api) {
  const { factory, fromBlockSickle, moeMasterchef } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);

  const tokens = await api.fetchList({ lengthAbi: 'getNumberOfFarms', itemAbi: 'getToken', target: moeMasterchef })

  const farmTokenMap = {}
  const farmIds = []
  tokens.forEach((token, index) => {
    farmTokenMap[index] = token
    farmIds.push(index)
  })

  const depositCalls = [];
  sickles.forEach(sickle => {
    farmIds.forEach(pid => {
      depositCalls.push({ target: moeMasterchef, params: [pid, sickle] });
    });
  });

  const deposits = await api.multiCall({
    abi: 'function getDeposit(uint256 pid, address account) view returns (uint256)',
    calls: depositCalls
  });

  depositCalls.forEach((call, index) => {
    const pid = call.params[0];
    const deposit = deposits[index];
    const token = farmTokenMap[pid];
    api.add(token, deposit)
  });
  return sumTokens2({ api, resolveLP: true });
}

Object.keys(config).forEach(chain => {
  let tvl
  switch (chain) {
    case 'base':
    case 'optimism': tvl = tvlBaseOptimism; break;
    case 'fraxtal':
    case 'avax':
    case 'arbitrum':
    case 'sonic':
    case 'hemi':
    case 'linea': tvl = tvlArbitrumLinea; break;
    case 'fantom': tvl = tvlFantom; break;
    case 'mode': tvl = modeTvl; break;
    case 'mantle': tvl = tvlMantle; break;
    default:
      tvl = genericTvl
  }

  module.exports[chain] = { tvl: tvl2 }
})

// module.exports.isHeavyProtocol = true
module.exports.misrepresentedTokens = true
let _get

async function tvl2(api) {
  if (!_get)
    _get = get(`https://api.vfat.io/v1/sickle-stats`)

  const { chainStats } = await _get
  chainStats.filter(chain => chain.chainId === api.chainId).forEach(chain => {
    api.addUSDValue(chain.tvl)
  })

}

module.exports.hemi =  { tvl: tvl2 }
