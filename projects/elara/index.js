const NAV_AGGREGATOR = '0x507f997c64dE57e189ed1ce95b832CE7b65FAc50'
const GET_NAV =
  'function getNAV() view returns (uint256 navUsd, uint256 walletBalanceUsd, uint256 positionValueUsd, uint64 computedAt)'

const tvl = async (api) => {
  const { navUsd } = await api.call({ target: NAV_AGGREGATOR, abi: GET_NAV })
  api.addUSDValue(Number(BigInt(navUsd) / 10n ** 12n) / 1e6)
}

module.exports = {
  start: '2026-06-16',
  methodology: 'TVL is Elara\'s gross on-chain NAV across registered treasury wallets and strategy positions.',
  ethereum: {
    tvl,
  },
}
