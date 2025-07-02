const { getLogs2 } = require('../helper/cache/getLogs')

const LOB_FACTORY = '0xfb2Ab9f52804DB8Ed602B95Adf0996aeC55ad6Df';
const VAULT_FACTORY = '0x0A3AA8f23c2125E91292b5F2b1F7b154a3FB1582';

const createdLOBEventAbi = "event OnchainCLOBCreated(address indexed creator, address OnchainCLOB, address tokenXAddress, address tokenYAddress, bool supports_native_eth, uint256 scaling_token_x, uint256 scaling_token_y, address administrator, address marketmaker, address pauser, bool should_invoke_on_trade, uint64 admin_commission_rate, uint64 total_aggressive_commission_rate, uint64 total_passive_commission_rate, uint64 passive_order_payout)"
const createdVaultEventAbi = "event LPManagerCreated(address indexed creator, address lpManager, address lpManagerImplementation, address liquidityToken)"
const vaultTokenChangedEventAbi = "event TokenChanged(uint8 tokenId, address tokenAddress, bool isActive, uint16 targetWeight, uint16 lowerBoundWeight, uint16 upperBoundWeight, uint8 decimals, uint24 oracleConfRel, bytes32 oraclePriceId)"

async function tvl(api) {
  const lobCreatedLogs = await getLogs2({ api, factory: LOB_FACTORY, eventAbi: createdLOBEventAbi, fromBlock: 6610800, })
  const vaultCreatedLogs = await getLogs2({ api, factory: VAULT_FACTORY, eventAbi: createdVaultEventAbi, fromBlock: 7059590, })
  const ownerTokens = lobCreatedLogs.map(log => [[log.tokenXAddress, log.tokenYAddress], log.OnchainCLOB]);
  const lpManagers = vaultCreatedLogs.map(log => log.lpManager);
  const tokenInfos = await api.fetchList({ lengthAbi: 'getTokensCount', itemAbi: "function tokens(uint256) view returns (address tokenAddress, bool isActive, uint16 targetWeight, uint16 lowerBoundWeight, uint16 upperBoundWeight, uint8 decimals, uint24 oracleConfRel, bytes32 oraclePriceId)", calls: lpManagers, groupedByInput: true, })
  lpManagers.forEach((lpManager, i) => {
    const tokens = tokenInfos[i].map(i => i.tokenAddress)
    ownerTokens.push([tokens, lpManager])
  })


  return api.sumTokens({ ownerTokens })
}

module.exports = {
  etlk: { tvl }
}