const DISTRIBUTOR = '0x9f7526EDAa18278D4bC1fA6b63B749A649Cb1844'

const abi = {
  getSale: 'function getSale(uint64 saleId) view returns (address depositToken, bytes32 whitelistRoot, uint256 startTime, uint256 endTime, uint256 minDeposit, uint256 totalDeposits, bool paused, uint256 pubStartTime, uint256 pubEndTime, uint256 pubTotalDeposits)',
  nextSaleId: 'uint64:nextSaleId',
}

async function tvl(api) {
  const nextSaleId = await api.call({ target: DISTRIBUTOR, abi: abi.nextSaleId })
  const saleIds = [...Array(+nextSaleId).keys()]
  const sales = await api.multiCall({ target: DISTRIBUTOR, abi: abi.getSale, calls: saleIds })
  const tokens = [...new Set(sales.map(s => s.depositToken))]
  return api.sumTokens({ tokens, owner: DISTRIBUTOR })
}

module.exports = {
  methodology:
    'TVL counts the deposit tokens locked in the PreIPO distributor contract during active subscription rounds',
  start: '2025-07-01',
  bsc: { tvl },
}
