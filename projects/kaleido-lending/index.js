const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

// Kaleido lending: a peer-to-peer market on an EIP-2535 diamond. Borrowers post collateral (EURC, cirBTC),
// lenders list native USDC; the diamond holds both until loans are drawn/repaid.
const DIAMOND = '0xE4e7f16DB22e6bb2E505fbC504d7B2B4B995A6E3'
const SENTINEL = '0x0000000000000000000000000000000000000001' // how the market registers native USDC

const abi = {
  getAllCollateralToken: 'function getAllCollateralToken() view returns (address[])',
  getLoanableAssets: 'function getLoanableAssets() view returns (address[])',
}

async function tvl(api) {
  const [collateral, loanable] = await Promise.all([
    api.call({ target: DIAMOND, abi: abi.getAllCollateralToken }),
    api.call({ target: DIAMOND, abi: abi.getLoanableAssets }),
  ])
  const all = [...collateral, ...loanable].map(t => t.toLowerCase())
  const tokens = [...new Set(all.map(t => (t === SENTINEL ? nullAddress : t)))]
  return sumTokens2({ api, owner: DIAMOND, tokens })
}

module.exports = {
  methodology:
    'TVL is the collateral and the lender-listed funds held by the Kaleido lending contract on Arc. Native USDC (the chain\'s gas token) is counted from the contract\'s native balance. Funds already lent out are not counted.',
  start: 1790640000, // 2026-09-29
  arc: { tvl },
}
