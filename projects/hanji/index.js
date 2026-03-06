const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  etlk: {
    lobsConfigs: [
      {
        factory: '0xfb2Ab9f52804DB8Ed602B95Adf0996aeC55ad6Df',
        fromBlock: 6610800,
      },
      {
        factory: '0x8f9949CF3B79bBc35842110892242737Ae11488F',
        fromBlock: 21922459,
      },
    ],
    vaultConfigs: [
      {
        factory: '0x0A3AA8f23c2125E91292b5F2b1F7b154a3FB1582',
        fromBlock: 7059590,
      },
    ],
  },
  base: {
    lobsConfigs: [
      {
        factory: '0xC7264dB7c78Dd418632B73A415595c7930A9EEA4',
        fromBlock: 37860153
      }
    ],
    vaultConfigs: [
      {
        factory: '0xA73d880193a96B1c1917680DE7b9B8225E717569',
        fromBlock: 37860177
      }
    ],
  },
  monad: {
    lobsConfigs: [
      {
        factory: '0x5C28a12C8EbAF8524A2Ba1fdc62565571Aec87f1',
        fromBlock: 38411390
      }
    ],
    vaultConfigs: [
      {
        factory: '0xcAAE28d9e26fD11178762E81C46853Ae096c1500',
        fromBlock: 38412016
      }
    ],
  },
};

const createdLOBEventAbi = "event OnchainCLOBCreated(address indexed creator, address OnchainCLOB, address tokenXAddress, address tokenYAddress, bool supports_native_eth, uint256 scaling_token_x, uint256 scaling_token_y, address administrator, address marketmaker, address pauser, bool should_invoke_on_trade, uint64 admin_commission_rate, uint64 total_aggressive_commission_rate, uint64 total_passive_commission_rate, uint64 passive_order_payout)"
const createdVaultEventAbi = "event LPManagerCreated(address indexed creator, address lpManager, address lpManagerImplementation, address liquidityToken)"

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: async (api) => {
    const chainConfig = config[chain];
    const ownerTokens = [];
    for (const { factory, fromBlock } of chainConfig.lobsConfigs) {
      const lobCreatedLogs = await getLogs2({ api, factory, eventAbi: createdLOBEventAbi, fromBlock, })
      ownerTokens.push(...lobCreatedLogs.map(log => [[log.tokenXAddress, log.tokenYAddress], log.OnchainCLOB]))
    }
    for (const { factory, fromBlock } of chainConfig.vaultConfigs) {
      const vaultCreatedLogs = await getLogs2({ api, factory, eventAbi: createdVaultEventAbi, fromBlock, })
      const lpManagers = vaultCreatedLogs.map(log => log.lpManager);
      const tokenInfos = await api.fetchList({ lengthAbi: 'getTokensCount', itemAbi: "function tokens(uint256) view returns (address tokenAddress, bool isActive, uint16 targetWeight, uint16 lowerBoundWeight, uint16 upperBoundWeight, uint8 decimals, uint24 oracleConfRel, bytes32 oraclePriceId)", calls: lpManagers, groupedByInput: true, })
      lpManagers.forEach((lpManager, i) => {
        const tokens = tokenInfos[i].map(i => i.tokenAddress)
        ownerTokens.push([tokens, lpManager])
      })
    }
    return api.sumTokens({ ownerTokens })
  } }  
});
