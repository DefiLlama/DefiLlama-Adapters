const ADDRESSES = require('../helper/coreAssets.json')

const MONETRIX_GENESIS_VAULT = '0xc50A1dd2866A822c81bd0aA00B638c4BdDc9cd63'
const USDM = '0xE2d2959f89B6389DeB624bF076Fe7D9E5401f377'

const USDC = ADDRESSES.hyperliquid.USDC

async function tvl(api) {
  // Pre-launch Genesis Vault USDC; migrates into the main MonetrixVault when users mint USDM
  await api.sumTokens({ owners: [MONETRIX_GENESIS_VAULT], tokens: [USDC] })

  // USDM is minted 1:1 against USDC collateral, so its total supply equals the USDC
  // backing the live token (the Genesis USDC above migrates into this supply as users
  // mint). Read from plain ERC20 storage so historical TVL backfills correctly — unlike
  // the MonetrixAccountant's mark-to-market backing, which is read via Hyperliquid
  // precompiles that only expose live state and cannot be queried at historical blocks.
  const usdmSupply = await api.call({ target: USDM, abi: 'erc20:totalSupply' }).catch(() => 0)
  if (usdmSupply) api.add(USDC, usdmSupply)
}

module.exports = {
  misrepresentedTokens: true,
  start: '2026-06-10',
  methodology:
    'TVL is the USDC collateral backing USDM. USDM is minted 1:1 against USDC, so the ' +
    'circulating USDM supply equals the USDC collateral held by the protocol (in the ' +
    'MonetrixVault, RedeemEscrow and the Hyperliquid Core account that runs the ' +
    'delta-neutral basis-trading strategy). USDC still in the pre-launch Genesis Vault ' +
    'is also counted and migrates into the supply as users mint USDM. Staked USDM ' +
    '(sUSDM), the insurance fund (funded from skimmed yield) and undistributed yield ' +
    'are excluded.',
  hyperliquid: {
    tvl,
  },
}
