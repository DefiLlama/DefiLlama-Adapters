const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs');

const config = {
  base: {
    factory: '0x71D234A3e1dfC161cc1d081E6496e76627baAc31',
    gaugeFactory: '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5',
    gaugeFactory2: '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08',
    voter: '0x16613524e02ad97edfef371bc883f2f5d6c480a5',
    NonfungiblePositionManager: '0x827922686190790b37229fd06084350E74485b72',
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
};


async function tvl(api) {
  const { factory, gaugeFactory, gaugeFactory2, voter, NonfungiblePositionManager, fromBlock, fromBlockSickle, chainName } = config[api.chain];

  // Fetch logs from both the factory and the voter contracts
  const [deployLogs, deployAeroLogs] = await Promise.all([
    getLogs({
      api,
      target: factory,
      fromBlock: fromBlockSickle,
      eventAbi: 'event Deploy(address indexed admin, address sickle)',
    }),
    getLogs({
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
    }),
  ]);


  // Get the addresses of deployed sickles
  const sickles = deployLogs.map(log => log.args.sickle);

  // Separate gauges by type
  const deployedAeroGauges = deployAeroLogs.reduce(
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

  const stakingTokens = await api.multiCall({ abi: 'address:stakingToken', calls: deployedAeroGauges.lp })
  const gaugeTokenMapping = {}
  stakingTokens.forEach((stakingToken, index) => {
    gaugeTokenMapping[deployedAeroGauges.lp[index]] = stakingToken
  })


  // Prepare balance queries for each gauge-sickle pair
  const balanceCallsLP = [];
  const tokens = [];

  for (const gauge of deployedAeroGauges.lp) {
    for (const sickle of sickles) {
      balanceCallsLP.push({ target: gauge, params: [sickle] });
      tokens.push(gaugeTokenMapping[gauge])
    }
  }

  const lpBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceCallsLP, })
  api.add(tokens, lpBals)


  // process NFT gauges 
  const pools = await api.multiCall({ abi: 'address:pool', calls: deployedAeroGauges.nft })
  const slot0s = await api.multiCall({ abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)', calls: pools })
  let i = 0

  await Promise.all(deployedAeroGauges.nft.map(async (gauge, i) => {
    const tick = slot0s[i].tick
    const nftIds = (await api.multiCall({ abi: 'function stakedValues(address depositor) view returns (uint256[])', calls: sickles, target: gauge })).flat()
    const positions = await api.multiCall({ abi: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)', calls: nftIds, target: NonfungiblePositionManager })
    positions.forEach(position => addUniV3LikePosition({ ...position, tick, api }))
  }))

  // unwrap uni v2 like LPs
  return sumTokens2({ api, resolveLP: true, })
}


Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})