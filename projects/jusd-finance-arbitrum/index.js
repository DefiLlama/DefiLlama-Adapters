const ADDRESSES = require('../helper/coreAssets.json')

// JUSD on Arbitrum: the Venzo-built JUSD vault. It holds native USDC (not USDC.e) and
// allocates it to JUSD's strategies. Venzo has no DefiLlama listing of its own, so this
// vault is not counted elsewhere.
const VAULT = '0x9519217E8926A2B39BAcD2d6EC3EfD02503595E2'

async function tvl(api) {
  const supply = await api.call({ target: VAULT, abi: 'erc20:totalSupply' })
  const assets = await api.call({
    target: VAULT,
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    params: [supply],
  })
  api.add(ADDRESSES.arbitrum.USDC_CIRCLE, assets)
}

module.exports = {
  methodology: 'TVL is the USDC value of the JUSD vault on Arbitrum (built on Venzo): its share supply valued with convertToAssets(), which uses the vault\'s signed daily NAV and covers idle USDC and capital allocated to strategies (principally delta-neutral funding trades, plus lending).',
  arbitrum: { tvl },
}
