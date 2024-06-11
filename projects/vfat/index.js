const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs');

const config = {
  base: {
    factory: '0x71D234A3e1dfC161cc1d081E6496e76627baAc31',
    gaugeFactory: '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5',
    gaugeFactory2: '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08',
    voter: '0x16613524e02ad97edfef371bc883f2f5d6c480a5',
    NonfungiblePositionManager: '0x827922686190790b37229fd06084350E74485b72',
    masterchefV3: '0xC6A2Db661D5a5690172d8eB0a7DEA2d3008665A3',
    fromBlock: 3200567,
    fromBlockSickle: 12116234,
    chainName: 'base',
  },
  optimism: {
    factory: '0xB4C31b0f0B76b351395D4aCC94A54dD4e6fbA1E8',
    gaugeFactory: '0x8391fE399640E7228A059f8Fa104b8a7B4835071',
    gaugeFactory2: '0x282AC0eA96493650F1A5E5e5d20490C782F1592a',
    voter: '0x41C914ee0c7E1A5edCD0295623e6dC557B5aBf3C',
    NonfungiblePositionManager: '0xbB5DFE1380333CEE4c2EeBd7202c80dE2256AdF4',
    fromBlock: 105896812,
    fromBlockSickle: 117753454,
    chainName: 'optimism',
  },
  arbitrum: {
    factory: '0x53d9780DbD3831E3A797Fd215be4131636cD5FDf',
    gaugeFactory: '0xAAA2564DEb34763E3d05162ed3f5C2658691f499',
    gaugeFactory2: '0xaa2fbd0c9393964af7c66c1513e44a8caaae4fda',
    NonfungiblePositionManager: '0xAA277CB7914b7e5514946Da92cb9De332Ce610EF',
    masterchefV3: '0x5e09ACf80C0296740eC5d6F643005a4ef8DaA694',
    fromBlock: 69820005,
    fromBlockSickle: 197499243,
    chainName: 'arbitrum',
  },
  linea: {
    factory: '0x0F6aBc6B808B377d6AeD8dA1FAD5E135C99C81a3',
    fromBlockSickle: 4949355,
    fromBlock: 381770,
    gaugeFactory: '0xAAA932839641c037452f826BB9d7B2057129833b',
    gaugeFactory2: '0xAAA2D4987EEd427Ba5E2c933EeFCD75C84b446B7',
    voter: '0xAAAf3D9CDD3602d117c67D80eEC37a160C8d9869',
    NonfungiblePositionManager: '0xAAA78E8C4241990B4ce159E105dA08129345946A',
    masterchefV3: '0x22E2f236065B780FA33EC8C4E58b99ebc8B55c57',
    chainName: 'linea',
  },
  ethereum: {
    factory: '0x9D70B9E5ac2862C405D64A0193b4A4757Aab7F95',
    chainName: 'ethereum',
    masterchefV3: '0x556B9306565093C855AEA9AE92A594704c2Cd59e',
    fromBlockSickle: 19580798,
  },
  mode: {
    factory: '0x53d9780DbD3831E3A797Fd215be4131636cD5FDf',
    chainName: 'mode',
    fromBlockSickle: 7464171,
    gaugeFactory: '0x31832f2a97Fd20664D76Cc421207669b55CE4BC0',
    voter: '0xD2F998a46e4d9Dd57aF1a28EBa8C34E7dD3851D7',
    fromBlock: 7453232,
  },
  fantom: {
    factory: '0x53d9780DbD3831E3A797Fd215be4131636cD5FDf',
    chainName: 'fantom',
    fromBlockSickle: 79166260,
    NonfungiblePositionManager: '0x2B52294425a9a229322228de659eDE9D146D7c2f',
    gaugeFactory: '0x5b3220cb732245ffe8e26df228ac93feb685c157',
    fromBlock: 58469764,
    voter: '0xe3d1a117df7dcac2eb0ac8219341bad92f18dac1',
  },
  mantle: {
    factory: '0xB4C31b0f0B76b351395D4aCC94A54dD4e6fbA1E8',
    chainName: 'mantle',
    fromBlockSickle: 62383980,
    moeMasterchef:  '0xA756f7D419e1A5cbd656A438443011a7dE1955b5'
  },
  bsc: {
    factory: '0x53d9780DbD3831E3A797Fd215be4131636cD5FDf',
    chainName: 'bsc',
    masterchefV3: '0x556B9306565093C855AEA9AE92A594704c2Cd59e',
    fromBlockSickle: 37565801
  },
};

// Helper function to fetch sickles
async function fetchSickles(api, factory, fromBlockSickle) {
  const deployLogs = await getLogs({
    api,
    target: factory,
    fromBlock: fromBlockSickle,
    eventAbi: 'event Deploy(address indexed admin, address sickle)',
  });
  return deployLogs.map(log => log.args.sickle);
}

// Helper function to fetch and process gauges
async function fetchGauges(api, voter, fromBlock, gaugeFactory, gaugeFactory2) {
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
      } else if (gaugeFactoryAddress === gaugeFactory2) {
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
  const sickleBalances = {};

  for (const sickle of sickles) {
    const balanceCallsSickle = [{ target: managerAddress, params: [sickle] }];
    const sickleBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCallsSickle });
    const balance = sickleBals[0];

    if (balance === '0') continue;

    const nftCalls = [];
    for (let i = 0; i < balance; i++) {
      nftCalls.push({ target: managerAddress, params: [sickle, i] });
    }

    const nftIds = await api.multiCall({ abi: 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)', calls: nftCalls });
    sickleBalances[sickle] = nftIds;
  }

  const positionCalls = [];
  for (const sickle in sickleBalances) {
    const nftIds = sickleBalances[sickle];
    nftIds.forEach(nftId => {
      positionCalls.push({ target: managerAddress, params: [nftId] });
    });
  }

  const positions = await api.multiCall({
    abi: isMasterchef
      ? 'function userPositionInfos(uint256 tokenId) view returns (uint128 liquidity, uint128 boostLiquidity, int24 tickLower, int24 tickUpper, uint256 rewardGrowthInside, uint256 reward, address user, uint256 pid, uint256 boostMultiplier)'
      : 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
    calls: positionCalls,
  });

  if (isMasterchef) {
    const poolInfoCalls = positions.map(position => ({
      target: managerAddress,
      params: [position.pid],
    }));

    const poolInfos = await api.multiCall({
      abi: 'function poolInfo(uint256 pid) view returns (uint256 allocPoint, address v3Pool, address token0, address token1, uint24 fee, uint256 totalLiquidity, uint256 totalBoostLiquidity)',
      calls: poolInfoCalls,
    });

    positions.forEach((position, index) => {
      const poolInfo = poolInfos[index];
      position.allocPoint = poolInfo.allocPoint;
      position.v3Pool = poolInfo.v3Pool;
      position.token0 = poolInfo.token0;
      position.token1 = poolInfo.token1;
      position.fee = poolInfo.fee;
      position.totalLiquidity = poolInfo.totalLiquidity;
      position.totalBoostLiquidity = poolInfo.totalBoostLiquidity;
    });
  }

  return positions;
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

async function getLPBalances(api, gauges, sickles, stakingTokens) {
  const gaugeTokenMapping = {};
  stakingTokens.forEach((stakingToken, index) => {
    gaugeTokenMapping[gauges[index]] = stakingToken;
  });

  const balanceCallsLP = [];
  const tokens = [];
  for (const gauge of gauges) {
    for (const sickle of sickles) {
      balanceCallsLP.push({ target: gauge, params: [sickle] });
      tokens.push(gaugeTokenMapping[gauge]);
    }
  }

  const lpBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCallsLP });

  return {
    balances: lpBals,
    tokens: tokens
  };
}

// TVL calculation for Base and Optimism
async function tvlBaseOptimism(api) {
  const { factory, gaugeFactory, gaugeFactory2, voter, NonfungiblePositionManager, fromBlock, fromBlockSickle, chainName } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);
  const deployedAeroGauges = await fetchGauges(api, voter, fromBlock, gaugeFactory, gaugeFactory2);
  const stakingTokens = await api.multiCall({ abi: 'address:stakingToken', calls: deployedAeroGauges.lp });
  const { balances, tokens } = await getLPBalances(api, deployedAeroGauges.lp, sickles, stakingTokens);

  api.add(tokens, balances);

  const pools = await api.multiCall({ abi: 'address:pool', calls: deployedAeroGauges.nft });
  const slot0s = await api.multiCall({ abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)', calls: pools });

  await Promise.all(deployedAeroGauges.nft.map(async (gauge, i) => {
    const tick = slot0s[i].tick;
    const nftIds = (await api.multiCall({ abi: 'function stakedValues(address depositor) view returns (uint256[])', calls: sickles, target: gauge })).flat();
    const positions = await api.multiCall({ abi: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)', calls: nftIds, target: NonfungiblePositionManager });
    positions.forEach(position => addUniV3LikePosition({ ...position, tick, api }));
  }));

  if (chainName === 'base') {
    const masterchefPositions = await fetchSickleNftPositions(api, sickles, config[api.chain].masterchefV3, true);
    masterchefPositions.forEach(position => addUniV3LikePosition({ ...position, api }));
  }

  return sumTokens2({ api, resolveLP: true });
}

// TVL calculation for Arbitrum and Linea
async function tvlArbitrumLinea(api) {
  const { factory, gaugeFactory, gaugeFactory2, voter, fromBlock, fromBlockSickle, chainName } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);
  const gauges = await fetchGauges2(api, fromBlock, gaugeFactory, gaugeFactory2, voter, chainName);
  const stakingTokens = await api.multiCall({ abi: 'address:stake', calls: gauges.lp });

  const { balances, tokens } = await getLPBalances(api, gauges.lp, sickles, stakingTokens);
  api.add(tokens, balances);

  const positions = await fetchSickleNftPositions(api, sickles, config[api.chain].NonfungiblePositionManager);
  const masterchefPositions = await fetchSickleNftPositions(api, sickles, config[api.chain].masterchefV3, true);

  positions.forEach(position => addUniV3LikePosition({ ...position, api }));
  masterchefPositions.forEach(position => addUniV3LikePosition({ ...position, api }));

  return sumTokens2({ api, resolveLP: true });

}

async function modeTvl(api) {
  const { factory, voter, fromBlock, fromBlockSickle, chainName } = config[api.chain];
  const sickles = await fetchSickles(api, factory, fromBlockSickle);
  const gauges = await fetchGauges3(api, voter, fromBlock);
  const stakingTokens = await api.multiCall({ abi: 'address:stakingToken', calls: gauges });
  const { balances, tokens } = await getLPBalances(api, gauges, sickles, stakingTokens);
  api.add(tokens, balances);
  return sumTokens2({ api, resolveLP: true });
}

// TVL calculation for chains with masterchefV3
async function genericTvl(api) {
  const { factory, fromBlockSickle, masterchefV3, NonfungiblePositionManager, chainName } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);

  if (masterchefV3) {
    const masterchefPositions = await fetchSickleNftPositions(api, sickles, masterchefV3, true);
    masterchefPositions.forEach(position => addUniV3LikePosition({ ...position, api }));
  }

  if (NonfungiblePositionManager) {
    const positions = await fetchSickleNftPositions(api, sickles, NonfungiblePositionManager);
    positions.forEach(position => addUniV3LikePosition({ ...position, api }));
  }

  return sumTokens2({ api, resolveLP: true });
}

async function fetchFantomGauges(api, fromBlock, gaugeFactory, voter, chainName) {
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
  });

  return deployLogs.map(log => log.args.g);
}

// TVL calculation for Fantom
async function tvlFantom(api) {
  const { factory, gaugeFactory, voter, fromBlock, fromBlockSickle, chainName } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);
  const gauges = await fetchFantomGauges(api, fromBlock, gaugeFactory, voter, chainName);
  const stakingTokens = await api.multiCall({ abi: 'address:stake', calls: gauges });
  const { balances, tokens } = await getLPBalances(api, gauges, sickles, stakingTokens);
  api.add(tokens, balances);

  return sumTokens2({ api, resolveLP: true });
}

async function tvlMantle(api) {
  const { factory, fromBlockSickle, moeMasterchef } = config[api.chain];

  const sickles = await fetchSickles(api, factory, fromBlockSickle);

  const numberOfFarms = await api.call({
    abi: 'function getNumberOfFarms() view returns (uint256)',
    target: moeMasterchef
  });

  const farmIds = Array.from({ length: numberOfFarms }, (_, i) => i);
  const tokens = await api.multiCall({
    abi: 'function getToken(uint256 pid) view returns (address)',
    calls: farmIds.map(pid => ({ target: moeMasterchef, params: [pid] }))
  });

  const farmTokenMap = farmIds.reduce((map, pid, index) => {
    map[pid] = tokens[index];
    return map;
  }, {});

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

  const tokenBalanceMap = {};

  depositCalls.forEach((call, index) => {
    const pid = call.params[0];
    const deposit = deposits[index];
    const token = farmTokenMap[pid];
    
    if (!tokenBalanceMap[token]) {
      tokenBalanceMap[token] = deposit;
    } else {
      tokenBalanceMap[token] = (BigInt(tokenBalanceMap[token]) + BigInt(deposit)).toString();
    }
  });

  const tokenList = Object.keys(tokenBalanceMap);
  const balanceList = Object.values(tokenBalanceMap);

  api.add(tokenList, balanceList);

  return sumTokens2({ api, resolveLP: true });
}

Object.keys(config).forEach(chain => {
  if (['base', 'optimism'].includes(chain)) {
    module.exports[chain] = { tvl: tvlBaseOptimism };
  } else if (['arbitrum', 'linea'].includes(chain)) {
    module.exports[chain] = { tvl: tvlArbitrumLinea };
  } else if (chain === 'fantom') {
    module.exports[chain] = { tvl: tvlFantom };
  } else if (chain === 'mode') {
    module.exports[chain] = { tvl: modeTvl };
  } else if (chain === 'mantle') {
    module.exports[chain] = { tvl: tvlMantle };
  } else if (!['base', 'optimism', 'arbitrum', 'linea', 'fantom', 'mode', 'mantle'].includes(chain)) {
    module.exports[chain] = { tvl: genericTvl };
  }
});