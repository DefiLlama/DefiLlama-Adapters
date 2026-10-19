const ADDRESSES = require('../helper/coreAssets.json')
const { getHypercoreStakedHype } = require('../helper/chain/hyperliquid')

const delegator = '0xCeaD893b162D38e714D82d06a7fe0b0dc3c38E0b'
const withdrawManager = '0x9d0B0877b9f2204CF414Ca7862E4f03506822538'
const WHYPE = ADDRESSES.hyperliquid.WHYPE

const tvl = async (api) => {
  const withdrawable = await api.call({ target: withdrawManager, abi: 'uint256:getLiquidHypeAmount' })
  api.add(WHYPE, withdrawable)
  api.add(WHYPE, await getHypercoreStakedHype(delegator))
}

module.exports = {
  timetravel: false,
  methodology: 'Counts the HYPE backing the Hyperbeat LST: liquid HYPE held by the WithdrawManager on HyperEVM plus the delegator\'s HyperCore staking balance (delegated, undelegated and pending withdrawal).',
  hyperliquid: { tvl }
}
