const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');

const ARBITRUM = 'arbitrum';

const FACTORIES = {
  [ARBITRUM]: [
    '0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c', // Factory
    '0x855F2c70cf5cb1D56C15ed309a4DfEfb88ED909E', // Quantum Factory
  ]
};

const POOL_WHITELIST = {
  [ARBITRUM]: [
    // Pools (standard + ARX pairs + LPs)
    '0x48d7E1a9d652ba5f5D80A8DC396dF37993659F35', '0x814df4dD3b2BFC7a37504308d3332691cB57eF32',
    '0xB7fa82d0493f6c51F03B1dA41387d3eEde594F6D', '0x27629D01f673D9f68EFA136C30865A5720dbF5C3',
    '0x06537920BDe4960713E220bd9CB4844a1461101C', '0xaFe48b65A14bE5Dba2693118B0901b322232c9F1', 
    '0xBB304E41a3Dcab1eEbe4bf9975E39f91fAbe69d0', '0x46Dc00f9dE3d51182F8686E1F8491645506e2F61',
    '0x3418F617C8EC5Efbcf929Fb2E33802C5A693F1C5', '0xaa58e42559ebf027f5b7f846b7debd8001e05a0c',
    '0x837823ED246A7e34a59aa96701C6f2de9E96D592', '0x76678c984b56371767ada0f5261d5a4b6b6536ee',
    '0x4f3867358a4c16fa8f71c9c4d5c87bc7b8837cd2', '0xfbedf907cbf73e19dcb6dd7f7d2806681dd966bb',
    '0x1bcf25125343d68b1b938faca4b993e82549612d', '0xe3d2f7c05b818ac79765329c953ef2427714fb5b',
    '0x9f637303e05d3fcf3a24e2a6a0724f6151cc1f57', '0xA6efAE0C9293B4eE340De31022900bA747eaA92D',
    '0x62FdDfC2D4b35aDec79c6082CA2894eAb01aC0db', '0x4C42fA9Ecc3A17229EDf0fd6A8eec3F11D7E00D3',
    '0xA6A6090749B9E3010802C5bFF3845aa6A4AC321B', '0x10A12127867d3885Ac64b51cc91a67c907eE51db',
    '0x75c8e847853c79C31b357C880a8e531fBCb6b52F', '0xF2EBC468bB84A0d220c36695b3c27DAa24beD87c',
    '0xE8C060d40D7Bc96fCd5b758Bd1437C8653400b0e', '0xEa5f97aab76E397E4089137345c38b5c4e7939B3',
    '0xECe52B1fc32D2B4f22eb45238210b470a64bfDd5', '0xeE5e74Dc56594d070E0827ec270F974A68EBAF22',
    '0xD082d6E0AF69f74F283b90C3CDa9C35615Bce367', '0xD65Ef54B1ff5D9a452B32Ac0c304d1674F761061',
    '0x39511b74722afE77d532Eb70632B4B59C559019b', '0x9d47610d6Cfc4719D05f4E84344A655fB4FD3f57',
    '0x00cABe722790e27Ca6154E8FC34281384aa7052C', '0xFeafF2443f2489366a62FDDc0114Ad53B9aa03E9',
    '0xe633C4321B066c1348B8D1694461Bc58161a8125',
    // Quantum Strategies (concentrated positions)
    '0xdBc35420adA6f048225D5f56e4744F467Ae98d99', '0x4B5CDc175EA9D2526BFFD156aeA3d22Ff6145798',
    '0x1bDe4A91d0ff7a353b511186768F4Cc070874556', '0xDE553150eF951800d2C85B06EE3012113d7a262f',
    '0xD3B90a1780b58c59a4333A879C7DF488876565F6', '0x1379Fa99279129476A54108259Da487294D53b97',
    '0xA1C443f7Ae3cec5a61a163b98461af6dC4A98a90', '0xcf8Ea96eCfdb7800E1Eb413bde4Af6ce984ab079',
    '0x02ebfb3aac7934cdc6877d5ee8cf5e17e449a9a3', '0xc1e2eda42ae3b3da68b622f03cd04ff3412467f7',
    '0x3369839e15d31b884dbd4e8e101fda0125fb08e8', '0xaca4edeee3a98a4311ec4c2a85c92163881f1644',
    '0xf2d53b528b30f46d08feb20f1524d04d97b614c4', '0x81e8be7795ed3d8619f037b8db8c80292332aa72',
    '0x2d3d9d377c046c218e0f3b5a6bd17c9e673f1d8c', '0x3fb86a978530d9881627907b428e9ac9c02f9406',
    '0xc4602d1415f32ae23a72ad8cf4371272e25e2f22', '0x8a8d968c9534727118aa02965f16f6d398c14b1d'
  ]
};

const STAKING_CONTRACTS = {
  [ARBITRUM]: [
    // Stakers (add balances from these)
    '0xee1D57aCE6350D70E8161632769d29D34B2FbfC8', '0x489732e4D028e500C327F1424931d428Ba695dF6',
    '0x907E5d334F27a769EF779358089fE5fdAA6cf2Bb', '0x75Bca51be93E97FF7D3198506f368b472730265a',
    '0x466f4380327cD948572AE0C98f2E04930ce05767', '0xf4752a5f352459948620e7C377b10ddcC92015c8',
    '0xe633C4321B066c1348B8D1694461Bc58161a8125', '0x87687Ffb83ab59379C3e2e853cb9Cb3DcC40dA2D',
    // AC (add these for earning pools)
    '0x494203AA41AC067bEb684912ad546d113925a13B', '0xd0D55B4C435823c1c2F4ed83877dC5B6e6e6200A',
    '0xFb5882514F843210aDA57Fdf91C45543048F8885', '0xDA594c20925712d60d0e7f8D70c9b8586bcd353f',
    '0x86B89ce3190724E370313a63D528F444627575B8'
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
      target: factory,
      fromBlock,
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
    await sumTokens2({ api, owners: stakingContracts, fetchCoValentTokens: true });
  }
}

module.exports = {
  methodology: 'TVL counts liquidity in Quantum Pools (concentrated), standard pools via factories, and staking contracts (ARXPool, Earn pools, AC). Uses whitelisted pools and strategies.',
  timetravel: true,
  misrepresentedTokens: false,
  arbitrum: { tvl }
};