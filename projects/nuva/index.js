const { get } = require('../helper/http')

const PROVENANCE_VAULT_API = 'https://api.provenance.io'
const NVYLDS_SHARE_DENOM = 'nuva.ylds'
const NVPRIME_ROUTER = '0x50AE1e4A612A4623b747aEeFb30aFBA82804e12c'

async function provenanceTvl(api) {
  const data = await get(
    `${PROVENANCE_VAULT_API}/vault/v1/vaults/${encodeURIComponent(NVYLDS_SHARE_DENOM)}`
  )
  const amount = data?.total_vault_value?.amount
  if (!amount) {
    throw new Error(`nvYLDS total_vault_value missing for ${NVYLDS_SHARE_DENOM}`)
  }
  api.addUSDValue(Number(amount) / 1e6)
}

async function ethereumTvl(api) {
  const nuvaVaultAddress = await api.call({
    target: NVPRIME_ROUTER,
    abi: 'address:nuvaVault',
  })

  await api.erc4626Sum({calls: [nuvaVaultAddress], isOG4626: true})
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  start: '2026-04-27',
  methodology:
    'NUVA TVL is the sum of (1) nvYLDS total_vault_value from the Provenance vault module (canonical vault state; Ethereum and Base bridge contracts are excluded to avoid double-counting bridged deposits) and (2) nvPRIME underlying assets held in the Ethereum Nuva vault.',
  provenance: { tvl: provenanceTvl },
  ethereum: { tvl: ethereumTvl },
}
