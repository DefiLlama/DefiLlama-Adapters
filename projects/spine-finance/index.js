const { sumTokens2 } = require('../helper/unwrapLPs')

const SPINE_VAULT = '0x38cc0dae2c4305c16f3d702f9a0260599e14654f'
const BORROW_CONTROLLER = '0xce1d096e3bd08b3114a23d916a45c7cf8966d6ea'
const DEBT_TOKEN = '0x5fc5360d0400a0fd4f2af552add042d716f1d168' // USDG
const COLLATERAL_TOKEN = '0x4bcb25fce9618e62e9f9fba8d65af50cf867b812' // PT-NVDA-15OCT2026

async function tvl(api) {
  const subVaults = await api.fetchList({ lengthAbi: 'subVaultsLength', itemAbi: 'function subVaults(uint256) view returns (address vault, uint64 weight, bool active)', target: SPINE_VAULT })
  return sumTokens2({
    api, ownerTokens: [
      [[DEBT_TOKEN, ...subVaults.map(v => v.vault)], SPINE_VAULT], // idle USDG + sub-vault shares
      [[COLLATERAL_TOKEN], BORROW_CONTROLLER], // posted collateral
    ]
  })
}

async function borrowed(api) {
  api.add(DEBT_TOKEN, await api.call({ abi: 'uint256:totalDebt', target: BORROW_CONTROLLER }))
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the idle USDG in the Spine vault, the vault\'s deposits in its ERC-4626 sub-vaults (currently Steakhouse USDG on Morpho), and the collateral posted in the borrow controller. Outstanding USDG loans are reported as borrowed.',
  robinhood: {
    tvl,
    borrowed,
  },
}