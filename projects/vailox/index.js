const ADDRESSES = require('../helper/coreAssets.json')

// Vailox: P2P crypto <-> fiat marketplace. Sellers lock stablecoins in the VailoxEscrow contract until the buyer's fiat
// payment is confirmed. The contract also holds protocol fees from completed trades (feesAvailable) until the owner
// withdraws them; those are not user deposits, so they are subtracted from the escrow balance.
const EVM_ESCROW = '0x8Da513d9B614D0a473eAf294E3e531Cd4EEa9984' // same CREATE2 address on every EVM chain

const config = {
  ethereum: { escrow: EVM_ESCROW, tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT] },
  polygon: { escrow: EVM_ESCROW, tokens: [ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDT] },
  arbitrum: { escrow: EVM_ESCROW, tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT] },
  base: { escrow: EVM_ESCROW, tokens: [ADDRESSES.base.USDC] },
  bsc: { escrow: EVM_ESCROW, tokens: [ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT] },
  tron: { escrow: 'TKTF8R8bak9oN1tDch6CFVyMWSakfRRZLK', tokens: [ADDRESSES.tron.USDT] },
}

async function tvl(api) {
  const { escrow, tokens } = config[api.chain]
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((token) => ({ target: token, params: [escrow] })) })
  const fees = await api.multiCall({ abi: 'function feesAvailable(address) view returns (uint256)', calls: tokens.map((token) => ({ target: escrow, params: [token] })) })
  tokens.forEach((token, i) => api.add(token, (BigInt(balances[i]) - BigInt(fees[i])).toString()))
}

module.exports = {
  methodology: 'Stablecoins locked in the VailoxEscrow contract for open P2P trades (seller deposit plus the seller fee held until release). Protocol fees already earned and awaiting withdrawal (feesAvailable) are excluded.',
  start: '2025-12-20',
}

Object.keys(config).forEach((chain) => { module.exports[chain] = { tvl } })
