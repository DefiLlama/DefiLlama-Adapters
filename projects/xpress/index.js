const { getLogs2 } = require('../helper/cache/getLogs')

const LOB_FACTORY = '0xB9A10c289eEb586556ed381f3d9E44F10Bda243f';
const VAULT_FACTORY = '0x130A7055601f340860CF7a09E042977307810823';

const createdLOBEventAbi = "event OnchainCLOBCreated(address indexed creator, address OnchainCLOB, address tokenXAddress, address tokenYAddress, bool supports_native_eth, uint256 scaling_token_x, uint256 scaling_token_y, address administrator, address marketmaker, address pauser, bool should_invoke_on_trade, uint64 admin_commission_rate, uint64 total_aggressive_commission_rate, uint64 total_passive_commission_rate, uint64 passive_order_payout)"
const createdVaultEventAbi = "event LPManagerCreated(address indexed creator, address lpManager, address lpManagerImplementation, address liquidityToken)"
const vaultTokenChangedEventAbi = "event TokenChanged(uint8 tokenId, address tokenAddress, bool isActive, uint16 targetWeight, uint16 lowerBoundWeight, uint16 upperBoundWeight, uint8 decimals, uint24 oracleConfRel, bytes32 oraclePriceId)"

async function tvl(api) {
  const lobCreatedLogs = await getLogs2({ api, factory: LOB_FACTORY, eventAbi: createdLOBEventAbi, fromBlock: 2193228, })
  const ownerTokens = lobCreatedLogs.map(log => [[log.tokenXAddress, log.tokenYAddress], log.OnchainCLOB]);

  const vaultCreatedLogs = await getLogs2({ api, factory: VAULT_FACTORY, eventAbi: createdVaultEventAbi, fromBlock: 11273140, })

  for (const log of vaultCreatedLogs) {
    const vaultTokenLogs = await getLogs2({ api, factory: log.lpManager, eventAbi: vaultTokenChangedEventAbi, fromBlock: 11273140, })
    const vaultTokens = new Set(vaultTokenLogs.map(log => log.tokenAddress));
    ownerTokens.push([[...vaultTokens], log.lpManager]);
  }

  return api.sumTokens({ ownerTokens })
}

module.exports = {
  sonic: { tvl }
}