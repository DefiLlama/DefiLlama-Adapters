const { getLogs2 } = require('../helper/cache/getLogs')

const lobsConfigs = [
  {
    factory: '0xB9A10c289eEb586556ed381f3d9E44F10Bda243f',
    fromBlock: 2193200,
  },
  {
    factory: '0x8829F42652135327Fa2AD92F11c7097d1a4B2299',
    fromBlock: 40894000,
  },
];

const vaultConfigs = [
  {
    factory: '0x130A7055601f340860CF7a09E042977307810823',
    fromBlock: 11273100,
  },
];

const createdLOBEventAbi = "event OnchainCLOBCreated(address indexed creator, address OnchainCLOB, address tokenXAddress, address tokenYAddress, bool supports_native_eth, uint256 scaling_token_x, uint256 scaling_token_y, address administrator, address marketmaker, address pauser, bool should_invoke_on_trade, uint64 admin_commission_rate, uint64 total_aggressive_commission_rate, uint64 total_passive_commission_rate, uint64 passive_order_payout)"
const createdVaultEventAbi = "event LPManagerCreated(address indexed creator, address lpManager, address lpManagerImplementation, address liquidityToken)"

async function tvl(api) {
  const ownerTokens = [];
  for (const { factory, fromBlock } of lobsConfigs) {
    const lobCreatedLogs = await getLogs2({ api, factory, eventAbi: createdLOBEventAbi, fromBlock, })
    ownerTokens.push(...lobCreatedLogs.map(log => [[log.tokenXAddress, log.tokenYAddress], log.OnchainCLOB]))
  }
  for (const { factory, fromBlock } of vaultConfigs) {
    const vaultCreatedLogs = await getLogs2({ api, factory, eventAbi: createdVaultEventAbi, fromBlock, })
    const lpManagers = vaultCreatedLogs.map(log => log.lpManager);
    const tokenInfos = await api.fetchList({ lengthAbi: 'getTokensCount', itemAbi: "function tokens(uint256) view returns (address tokenAddress, bool isActive, uint16 targetWeight, uint16 lowerBoundWeight, uint16 upperBoundWeight, uint8 decimals, uint24 oracleConfRel, bytes32 oraclePriceId)", calls: lpManagers, groupedByInput: true, })
    lpManagers.forEach((lpManager, i) => {
      const tokens = tokenInfos[i].map(i => i.tokenAddress)
      ownerTokens.push([tokens, lpManager])
    })
  }

  return api.sumTokens({ ownerTokens })
}

module.exports = {
  sonic: { tvl }
}