const DISTRIBUTOR = '0x9f7526EDAa18278D4bC1fA6b63B749A649Cb1844'

// On-chain saleId is 0-indexed (backend project IDs start at 1).
// Add new sale IDs here when future Pre-IPO projects launch on Lista.
const SALE_IDS = [0]

const abi = {
  getSale:
    'function getSale(uint64 saleId) view returns (address depositToken, bytes32 whitelistRoot, uint256 startTime, uint256 endTime, uint256 minDeposit, uint256 totalDeposits, bool paused, uint256 pubStartTime, uint256 pubEndTime, uint256 pubTotalDeposits)',
}

async function tvl(api) {
  const sales = await api.multiCall({
    target: DISTRIBUTOR,
    abi: abi.getSale,
    calls: SALE_IDS,
  })
  const tokens = [...new Set(sales.map(s => s.depositToken))]
  return api.sumTokens({ tokens, owner: DISTRIBUTOR })
}

module.exports = {
  methodology:
    'TVL counts the deposit tokens locked in the PreIPO distributor contract during active subscription rounds',
  start: '2025-07-01',
  bsc: { tvl },
}
