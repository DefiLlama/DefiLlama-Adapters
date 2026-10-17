const sdk = require('@defillama/sdk')
const { getProgramMappingValue } = require('../helper/chain/aleo')

// JUSD on Aleo: users deposit USDCx into jusd_vault_production.aleo and receive Aleo JUSD
// (token_registry.aleo token 1247105860field). The vault bridges the USDC to Ethereum
// (Circle xReserve), where the JusdAleoAdapter deposits it into the Ethereum JUSD vault and
// holds the shares, so every Aleo JUSD is backed by Ethereum JUSD held by the adapter.
// Source: https://github.com/JPEG-Group/jpeg-aleo
const ETH_JUSD_VAULT = '0x2B5895b716311A1eaC8f93fB88C56aF9eC8C1A69' // Ethereum JUSD vault (Accountable)
const ETH_ADAPTER = '0x65DD658a02FaAdD866423cc08Dde9c89fFE345aA' // JusdAleoAdapter proxy (production)
const ALEO_VAULT = 'aleo19vl8qekcpgngdfhchgcfajdme45capkjw0uzvsjs6aqj7dm50u8qyt2dhh' // jusd_vault_production.aleo
const USDCX = 'usdcx_stablecoin.aleo'

const stripType = (v) => (v ? BigInt(String(v).replace(/u\d+$/, '')) : 0n)

async function aleoUsdcx() {
  try {
    return stripType(await getProgramMappingValue(USDCX, 'balances', ALEO_VAULT))
  } catch (e) {
    if (e.response && e.response.status === 404) return 0n
    throw e
  }
}

async function tvl(api) {
  // 1) The Ethereum JUSD position backing Aleo JUSD: shares held by the adapter plus any of its
  // shares queued for or awaiting redemption, valued with the vault's convertToAssets, and USDC
  // that has arrived from Aleo but is not yet deposited.
  const eth = new sdk.ChainApi({ chain: 'ethereum', timestamp: api.timestamp })
  const state = await eth.call({
    target: ETH_ADAPTER,
    abi: 'function state() view returns (uint256 usdcBal, uint256 jusdBal, uint256 pending, uint256 claimable)',
    permitFailure: true, // the adapter does not exist before Oct 2026
  })
  let usdc = 0n
  if (state) {
    const shares = BigInt(state.jusdBal) + BigInt(state.pending) + BigInt(state.claimable)
    const assets = await eth.call({
      target: ETH_JUSD_VAULT,
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      params: [shares.toString()],
    })
    usdc += BigInt(assets) + BigInt(state.usdcBal)
  }

  // 2) USDCx held by the Aleo vault: deposits not yet bridged and redemptions awaiting claim.
  // Aleo mappings only expose current state, so this part is not historical (it is a small float).
  usdc += await aleoUsdcx()

  api.addCGToken('usd-coin', Number(usdc) / 1e6)
}

module.exports = {
  methodology: 'Counts deposits made on Aleo. Aleo JUSD is backed by Ethereum JUSD held by the JUSD Aleo adapter, so TVL is that position (shares held, queued and claimable, valued with the Ethereum vault\'s convertToAssets) plus USDC waiting in the adapter, plus USDCx held by the Aleo vault program. The adapter\'s position is excluded from the JUSD Finance Ethereum TVL, so these deposits are counted once, on Aleo.',
  aleo: { tvl },
}
