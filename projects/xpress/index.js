const { getLogs2 } = require('../helper/cache/getLogs')

const LOB_FACTORY = '0xB9A10c289eEb586556ed381f3d9E44F10Bda243f';

const createdLOBEventAbi = "event OnchainCLOBCreated(address indexed creator, address OnchainCLOB, address tokenXAddress, address tokenYAddress, bool supports_native_eth, uint256 scaling_token_x, uint256 scaling_token_y, address administrator, address marketmaker, address pauser, bool should_invoke_on_trade, uint64 admin_commission_rate, uint64 total_aggressive_commission_rate, uint64 total_passive_commission_rate, uint64 passive_order_payout)"

async function tvl(api) {
  const lobCreatedLogs = await getLogs2({ api, factory: LOB_FACTORY, eventAbi: createdLOBEventAbi, fromBlock: 2193228, })
  const ownerTokens = lobCreatedLogs.map(log => [[log.tokenXAddress, log.tokenYAddress], log.OnchainCLOB]);
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  sonic: { tvl }
}