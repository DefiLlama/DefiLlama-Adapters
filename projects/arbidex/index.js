const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');

const ARBITRUM = 'arbitrum';

const ARX = '0xd5954c3084a1cCd70B4dA011E67760B8e78aeE84';

const FACTORIES = {
  [ARBITRUM]: [
    { address: '0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c', fromBlock: 80000000 }, // Factory
    { address: '0x855F2c70cf5cb1D56C15ed309a4DfEfb88ED909E', fromBlock: 120000000 }, // Quantum Factory (likely deployed later)
    
  ]
};

const POOL_WHITELIST = {
  [ARBITRUM]: [
    // Pools (standard + ARX pairs + LPs)
    '0x48d7E1a9d652ba5f5D80A8DC396dF37993659F35', '0x814df4dD3b2BFC7a37504308d3332691cB57eF32',
    '0xB7fa82d0493f6c51F03B1dA41387d3eEde594F6D', '0x27629D01f673D9f68EFA136C30865A5720dbF5C3',
    '0x06537920BDe4960713E220bd9CB4844a1461101C', '0xaFe48b65A14bE5Dba2693118B0901b322232c9F1', 
    '0xBB304E41a3Dcab1eEbe4bf9975E39f91fAbe69d0', '0x46Dc00f9dE3d51182F8686E1F8491645506e2F61',
    '0x3418F617C8EC5Efbcf929Fb2E33802C5A693F1C5', '0xaa58e42559ebf027f5b7f846b7debd8001e05a0c'
  ]
};

const STAKING_CONTRACTS = {
  [ARBITRUM]: [
    // Stakers (add balances from these)
    '0xee1D57aCE6350D70E8161632769d29D34B2FbfC8', '0x489732e4D028e500C327F1424931d428Ba695dF6',
    '0x907E5d334F27a769EF779358089fE5fdAA6cf2Bb', '0x75Bca51be93E97FF7D3198506f368b472730265a',
    '0x466f4380327cD948572AE0C98f2E04930ce05767', '0xf4752a5f352459948620e7C377b10ddcC92015c8'
  ]
};

const uniswapConfig = {
  eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
  topics: ['0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'],
};

async function tvl(api) {
  const chain = api.chain;
  const factories = FACTORIES[chain] || [];
  const poolWhitelist = (POOL_WHITELIST[chain] || []).map(addr => addr.toLowerCase());
  const stakingContracts = STAKING_CONTRACTS[chain] || [];

  // Get all pools from all factories
  const allLogs = [];
  for (const factory of factories) {
    const logs = await getLogs({
      api,
      target: factory.address,
      fromBlock: factory.fromBlock,
      topics: uniswapConfig.topics,
      eventAbi: uniswapConfig.eventAbi,
      onlyArgs: true,
    });
    allLogs.push(...logs);
  }

  // Filter pools by whitelist if provided
  let ownerTokens = allLogs.map(i => [[i.token0, i.token1], i.pool]);
  if (poolWhitelist.length > 0) {
    ownerTokens = ownerTokens.filter(([, pool]) => poolWhitelist.includes(pool.toLowerCase()));
  }

  // Get TVL from pools
  await sumTokens2({ api, ownerTokens, permitFailure: ownerTokens.length > 2000 });

  // Add staking contracts TVL
  if (stakingContracts.length > 0) {
    await sumTokens2({ api, owners: stakingContracts });
  }
}

module.exports = {
  methodology: 'TVL counts liquidity in Quantum Pools (concentrated), standard pools via factories, and staking contracts (ARXPool, Earn pools, AC). Uses whitelisted pools and strategies.',
  timetravel: true,
  misrepresentedTokens: false,
  arbitrum: { tvl }
};
