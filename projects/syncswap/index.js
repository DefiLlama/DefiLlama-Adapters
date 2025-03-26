const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

async function tvl(api) {
  const { fromBlock, classicFactorys = [], stableFactorys = [], aquaFactorys = [], rangedFactorys = [] } = config[api.chain]

  const logs = await Promise.all([...classicFactorys, ...stableFactorys, ...aquaFactorys].map(factory => (getFactoryLogs(api, factory))));

  let balances = {}
  const data = []

  const reserves = await Promise.all(logs.map(log => (api.multiCall({ abi: 'function getReserves() external view returns (uint, uint)', calls: log.map(i => i.pool) }))))

  for (let i = 0; i < logs.length; i++) {
    if (i < classicFactorys.length) {
      reserves[i].forEach(([token0Bal, token1Bal], j) => {
        data.push({ token0Bal, token1Bal, token0: logs[i][j].token0, token1: logs[i][j].token1 })
      })
    } else {
      reserves[i].forEach(([reserve0, reserve1], j) => {
        sdk.util.sumSingleBalance(balances, logs[i][j].token0, reserve0)
        sdk.util.sumSingleBalance(balances, logs[i][j].token1, reserve1)
      })
    }
  }

  const v3logs = await Promise.all(rangedFactorys.map(factory => getV3FactoryLogs(api, factory)));

  const pairs = {};
    v3logs.flat().forEach(([token0, token1, , pair]) => {
      const pairAddress = pair.toLowerCase();
      pairs[pairAddress] = {
        token0Address: token0.toLowerCase(),
        token1Address: token1.toLowerCase(),
      };
  });

  const balanceCalls = [];
    Object.entries(pairs).forEach(([pair, { token0Address, token1Address }]) => {
      balanceCalls.push({ target: token0Address, params: [pair] });
      balanceCalls.push({ target: token1Address, params: [pair] });
  });

  const tokenBalances = await api.multiCall({ calls: balanceCalls, abi: 'erc20:balanceOf' })
  
  balanceCalls.forEach(({ target }, i) => {
    sdk.util.sumSingleBalance(balances, target, tokenBalances[i])
  })

  return transformDexBalances({ balances, data, chain: api.chain })

  async function getFactoryLogs(api, factory) {
    return getLogs({
      api,
      target: factory,
      fromBlock,
      topic: 'PoolCreated(address,address,address)',
      eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, address pool)',
      onlyArgs: true,
    })
  }

  async function getV3FactoryLogs(api, factory) {
    return getLogs({
      api,
      target: factory,
      fromBlock,
      topic: "PoolCreated(address,address,int24)",
      eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, int24 indexed tickSpacing, address pool)',
      onlyArgs: true,
    })
  }
}

const config = {
  era: {
    fromBlock: 9775,
    stableFactorys: ['0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3', '0x81251524898774F5F2FCaE7E7ae86112Cb5C317f', '0x582ad7014C3f755Fc0d29eCFC02FAB4c3A2D5a3D'],
    classicFactorys: ['0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb', '0x0a34FBDf37C246C0B401da5f00ABd6529d906193', '0xA757eD0812092E2a8F78e6642a2A3215995A4131'],
    aquaFactorys: ['0x20b28B1e4665FFf290650586ad76E977EAb90c5D', '0xFfa499b019394d9bEB5e21FC54AD572E4942302b', '0x0754870C1aAb00eDCFABDF4e6FEbDD30e90f327d'],
    rangedFactorys: ['0x9D63d318143cF14FF05f8AAA7491904A494e6f13']
  },
  linea: {
    fromBlock: 716,
    stableFactorys: ['0xE4CF807E351b56720B17A59094179e7Ed9dD3727', '0x61Abf754fc031C544236053495a193f3518e9101', '0x024A096bAb43587d24004C95C3e20FcB7518Ad86'],
    classicFactorys: ['0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d', '0x9573994Ae6C9b35627976d26FA89e507e71FBaA2', '0xb8AbaEa25E42DA5ac6897C9DAb0a8157885fE32b'],
    aquaFactorys: ['0x7a31060d8524c21496a352BE65549eEf1e864fb0', '0x1080EE857D165186aF7F8d63e8ec510C28A6d1Ea'],
    rangedFactorys: ['0xc5916f6cF441c72DaA2E2C48AfC7CE642eEe6690']
  },
  sophon: {
    fromBlock: 38459,
    stableFactorys: ['0x8c9d66ba3e1d7681cffffa3c7d9807adae368e74'],
    classicFactorys: ['0x432bcc3bc62de9186f9e8763c82d43e418681e6c'],
    aquaFactorys: ['0xa2e2f6b5db704fde654db69895c89523332e538e'],
    rangedFactorys: ['0x0f6e27007e257e74c86522387BD071D561ba3C97']
  },
  scroll: {
    fromBlock: 80875,
    stableFactorys: ['0xE4CF807E351b56720B17A59094179e7Ed9dD3727', '0x5BEBDA7E264b03bB963CB2418f40C5ffcefb7A9e', '0xA2acA673C00495A184F88De533BBa8e1b7f38D00'],
    classicFactorys: ['0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d', '0xDAEdEcF3F1Caf8d9050A0C973B77E40bA8024F69', '0x76f549af692efA64952d02c075226df9878Fb54C'],
    aquaFactorys: ['0xa033eAbcCfd9b71543E34dec43935467A230Ce2d', '0x87aeb51d606056F48D241C4072f55ACd9D937018']
  },
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })
