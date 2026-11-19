// Bima Credit: fixed-term, collateralised credit vaults.
// Every strategy is created by a CollateralFixedTermFactory, which pairs it with an
// ERC-4626-style vault holding the lent asset. Lenders deposit into the vault; when the
// borrower draws, funds leave the vault and are tracked as the strategy's outstanding principal.

// CollateralFixedTermFactory per chain
const FACTORIES = {
  monad: '0x8731e1caf2b8159c9dbcd496c07211a20b5f277a',
  ethereum: '0xcC2Af6B6B3a888D96166205B9bA27d7dba3a67DE',
  base: '0xcC2Af6B6B3a888D96166205B9bA27d7dba3a67DE',
  bsc: '0xF9a0197f9dB6bd8171EBa53D21cb098597D23871',
}

// Internal test strategies deployed through the production factories — excluded from TVL.
const EXCLUDED_STRATEGIES = {
  monad: [
    '0x017D3dC2f035347A1F5C6896A9Ea3960B0fbC0C7', // SiskinBimaMonadTest
    '0xda3fd06AbD7e947B71Ac332Ae81e684c8dDCC99C', // SiskinBimaMonadTest1
  ],
  base: [
    '0xc3b59773c1535A70E1c7980ed89cb0608Ed29C43', // SiskinBimaBaseTest1
    '0xf747A93337A37a29A94aa0afFB3e2AA1Ae6F14EF', // SiskinBimaBaseTest3
  ],
  bsc: [
    '0x4983eE28ee8eeDa2E04213c4cd18b53898DF69F6', // SiskinBimaBNBTest2
  ],
}

const LOAN_ABI = 'function loan() view returns ((uint256 minDeposit, uint256 minRedeem, uint256 maxCapacity, uint256 minCapacity, uint256 reserveThreshold, uint256 outstandingPrincipal, uint256 outstandingInterest, uint256 drawableFunds, uint256 interestRate, uint256 lateInterestPenalty, uint256 claimableInterest, uint256 interestInterval, uint256 startTime, uint256 termsSetTime, uint256 termsUpdateTime, uint256 duration, uint256 depositPeriod, uint256 acceptGracePeriod, uint256 withdrawalPeriod, uint256 lateInterestGracePeriod))'

async function getMarkets(api) {
  const FACTORY = FACTORIES[api.chain]
  const count = await api.call({ target: FACTORY, abi: 'uint256:getStrategiesCount' })
  const excluded = new Set((EXCLUDED_STRATEGIES[api.chain] || []).map(s => s.toLowerCase()))
  const allStrategies = await api.call({
    target: FACTORY,
    abi: 'function getStrategiesPaginated(uint256 start, uint256 end) view returns (address[])',
    params: [0, count],
  })
  const strategies = allStrategies.filter(s => !excluded.has(s.toLowerCase()))
  const vaults = await api.multiCall({ target: FACTORY, abi: 'function getStrategyVault(address) view returns (address)', calls: strategies })
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults })
  return { strategies, vaults, assets }
}

// Idle lender deposits sitting in the vaults (not yet drawn by borrowers)
async function tvl(api) {
  const { vaults, assets } = await getMarkets(api)
  return api.sumTokens({ tokensAndOwners2: [assets, vaults] })
}

// Principal drawn by borrowers and still outstanding
async function borrowed(api) {
  const { strategies, assets } = await getMarkets(api)
  const loans = await api.multiCall({ abi: LOAN_ABI, calls: strategies })
  loans.forEach((loan, i) => api.add(assets[i], loan.outstandingPrincipal))
}

module.exports = {
  methodology: 'TVL is the balance of lent assets held in Bima Credit vaults created by the CollateralFixedTermFactory on each chain. Borrowed is the outstanding principal drawn by borrowers from those vaults.',
}

Object.keys(FACTORIES).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})
