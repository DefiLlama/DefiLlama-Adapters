const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { getProgramMappingValue } = require('../helper/chain/aleo')

// JUSD allocates deposited USDC across yield strategies, principally delta-neutral
// funding trades plus lending. It is issued through two vaults, Accountable on Ethereum and
// Venzo on Arbitrum, and through jusd_vault_production.aleo on Aleo, which takes USDCx deposits
// on Aleo, bridges them to Ethereum (Circle xReserve) and holds Ethereum JUSD through its adapter.
// Each deposit is credited to the chain it was made on, as Makina credits a machine's spoke
// capital to its hub chain and nets nested machine shares out of the machine they were bought in.
const VAULTS = {
  ethereum: '0x2B5895b716311A1eaC8f93fB88C56aF9eC8C1A69', // JUSD vault (Accountable)
  arbitrum: '0x9519217E8926A2B39BAcD2d6EC3EfD02503595E2', // JUSD vault (Venzo)
}
const USDC = {
  ethereum: ADDRESSES.ethereum.USDC,
  arbitrum: ADDRESSES.arbitrum.USDC_CIRCLE, // native USDC, not USDC.e
}
const ALEO_ADAPTER = '0x65DD658a02FaAdD866423cc08Dde9c89fFE345aA' // Ethereum side of jusd_vault_production.aleo
const ALEO_ADAPTER_BLOCK = 26096619 // adapter deployment (1 Oct 2026)
const ALEO_VAULT = 'aleo19vl8qekcpgngdfhchgcfajdme45capkjw0uzvsjs6aqj7dm50u8qyt2dhh' // jusd_vault_production.aleo
const adapterStateAbi = 'function state() view returns (uint256 usdcBal, uint256 jusdBal, uint256 pending, uint256 claimable)'
const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)'

// Ethereum JUSD shares held for Aleo depositors (held, queued and claimable), plus USDC waiting in the adapter
async function aleoPosition(ethApi) {
  if (await ethApi.getBlock() < ALEO_ADAPTER_BLOCK) return { shares: 0n, usdc: 0n }
  const s = await ethApi.call({ target: ALEO_ADAPTER, abi: adapterStateAbi })
  return { shares: BigInt(s.jusdBal) + BigInt(s.pending) + BigInt(s.claimable), usdc: BigInt(s.usdcBal) }
}

async function tvl(api) {
  const vault = VAULTS[api.chain]
  let shares = BigInt(await api.call({ target: vault, abi: 'erc20:totalSupply' }))
  if (api.chain === 'ethereum') shares -= (await aleoPosition(api)).shares // counted on Aleo instead
  const assets = await api.call({ target: vault, abi: convertToAssetsAbi, params: [shares.toString()] })
  api.add(USDC[api.chain], assets)
}

async function aleoTvl(api) {
  const ethApi = new sdk.ChainApi({ chain: 'ethereum', timestamp: api.timestamp })
  if (await ethApi.getBlock() < ALEO_ADAPTER_BLOCK) return
  const { shares, usdc } = await aleoPosition(ethApi)
  let total = usdc
  if (shares > 0n) total += BigInt(await ethApi.call({ target: VAULTS.ethereum, abi: convertToAssetsAbi, params: [shares.toString()] }))
  // USDCx held by the Aleo vault (deposits not yet bridged, redemptions not yet claimed); current state only
  total += await aleoUsdcx()
  api.addCGToken('usd-coin', Number(total) / 1e6)
}

async function aleoUsdcx() {
  try {
    const v = await getProgramMappingValue('usdcx_stablecoin.aleo', 'balances', ALEO_VAULT)
    return v ? BigInt(String(v).replace(/u\d+$/, '')) : 0n
  } catch (e) {
    if (e.response && e.response.status === 404) return 0n // no balance entry
    throw e
  }
}

module.exports = {
  methodology: 'TVL is the USDC value of JUSD on each chain it is issued on: the Accountable vault on Ethereum and the Venzo vault on Arbitrum (share supply valued with convertToAssets(), covering idle USDC and capital allocated to strategies, principally delta-neutral funding trades plus lending), and jusd_vault_production.aleo on Aleo. Aleo deposits are bridged to Ethereum and held as Ethereum JUSD by the vault\'s adapter; that position is counted on Aleo, where the deposits were made, and subtracted from Ethereum, so nothing is counted twice. The Ethereum vault is also part of Accountable, so this listing is marked as double counted.',
  doublecounted: true,
  ethereum: { tvl },
  arbitrum: { tvl },
  aleo: { tvl: aleoTvl },
}
