const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Avocado Fund — uncollateralised USDC lending on Arbitrum One
// https://avocado.fund | https://github.com/0x-Naomi/avocado-fund
const USDC = ADDRESSES.arbitrum.USDC_CIRCLE
const VAULT = '0xa3185e9AD376BC95600b65648bac02aF23653741' // AvocadoVault (ERC-4626, avUSDC shares)
const LENDING = '0xFF27bAeE76495a33CAed3c7cad31E404034b8911' // AvocadoLending (credit lines, borrow/repay)

// TVL = USDC actually held by the protocol: idle USDC in the ERC-4626 vault plus
// USDC deployed to the lending contract but not yet drawn by borrowers.
// USDC out with borrowers is excluded here and reported under `borrowed`.
const tvl = async (api) => sumTokens2({ api, owners: [VAULT, LENDING], tokens: [USDC] })

// Outstanding borrower debt (principal + accrued interest), read from the lending contract.
const borrowed = async (api) => {
  const debt = await api.call({ abi: 'uint256:totalOutstandingDebt', target: LENDING })
  api.add(USDC, debt)
}

module.exports = {
  methodology:
    'TVL counts the USDC balance held by the AvocadoVault (ERC-4626, avUSDC) and by the AvocadoLending contract on Arbitrum One. Borrowed counts totalOutstandingDebt() on the AvocadoLending contract, which is uncollateralised borrower principal plus accrued interest. Uncollateralised debt is excluded from TVL so lender deposits are not double counted with funds drawn by borrowers.',
  // AvocadoVault deployed 2026-05-01 (Arbitrum block 458279525, tx 0x67ea3ee8...bda6e0)
  start: '2026-05-01',
  arbitrum: {
    tvl,
    borrowed,
  },
}
