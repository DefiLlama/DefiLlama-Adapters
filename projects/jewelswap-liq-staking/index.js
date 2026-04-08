const { getTokenData, sumTokens, } = require('../helper/chain/elrond')
const { nullAddress } = require('../helper/tokenMapping')
const sui = require('../helper/chain/sui')
const radixdlt = require('../helper/chain/radixdlt')

// Sui object IDs
const NATIVE_POOL_ID = '0xed91ba2662e6f615d74614484d3a04373b2a1bb4c56e2ae1dda655141e6306bf'
const TOKEN_INFO_CETUS_ID = '0x084b2bf92e36dec2d8fbc4330e756263d59e5c3e3ed1cf4863e05c74d1fdefde'
const TOKEN_INFO_SCA_ID = '0x89f42e78ccc517f6641d10163ed39dd6a464d9a01a8d67ea5eb1d7b52782a89f'

// Sui token types
const CETUS = '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS'
const SCA = '0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA'
const SUI_TOKEN = '0x2::sui::SUI'
// MultiversX contracts
const JWLASH_STAKING = 'erd1qqqqqqqqqqqqqpgqhw2s04kx5crn2yvx5p253aa8fmganjjqdfysjvnluz'

// Radix component address
const RADIX_COMPONENT = 'component_rdx1cpfd7h09g5v5rsydg4796a3vthsalqae7cdlzytesh429mx4fkk26d'

async function suiTvl(api) {
  const [nativePool, cetusInfo, scaInfo] = await sui.getObjects([NATIVE_POOL_ID, TOKEN_INFO_CETUS_ID, TOKEN_INFO_SCA_ID])

  // jwlSUI: vault + pending stake + pending liquidity + delegated to validators
  if (nativePool) {
    api.add(SUI_TOKEN, nativePool.fields?.sui_vault || 0)
    api.add(SUI_TOKEN, nativePool.fields?.total_sui_to_stake || 0)
    api.add(SUI_TOKEN, nativePool.fields?.total_sui_to_add_liquidity || 0)
    const vaultsTableId = nativePool.fields?.validator_set?.fields?.vaults?.fields?.id?.id
    if (vaultsTableId) {
      const vaultEntries = await sui.getDynamicFieldObjects({ parent: vaultsTableId })
      for (const entry of vaultEntries) {
        api.add(SUI_TOKEN, entry.fields?.value?.fields?.total_staked || 0)
      }
    }
  }

  // jwlCETUS: vault + xCETUS (locked in Cetus governance) + pending
  if (cetusInfo) {
    api.add(CETUS, cetusInfo.fields?.cetus_vault || 0)
    api.add(CETUS, cetusInfo.fields?.total_cetus_staked || 0)
    api.add(CETUS, cetusInfo.fields?.total_cetus_to_stake || 0)
    api.add(CETUS, cetusInfo.fields?.total_cetus_to_add_liquidity || 0)
  }

  // jwlSCA: vault + veSCA (locked in Scallop governance) + pending
  if (scaInfo) {
    api.add(SCA, scaInfo.fields?.sca_vault || 0)
    api.add(SCA, scaInfo.fields?.total_sca_staked || 0)
    api.add(SCA, scaInfo.fields?.total_sca_to_stake || 0)
    api.add(SCA, scaInfo.fields?.total_sca_to_add_liquidity || 0)
  }
}

async function elrondTvl(api) {
  const [data, data2, data3] = await Promise.all([
    getTokenData('JWLEGLD-023462'),
    getTokenData('JWLASH-f362b9'),
    getTokenData('JWLUSD-62939e'),
  ])
  api.add(nullAddress, data.minted - data.burnt)
  api.add('JWLASH-f362b9', data2.minted - data2.burnt)
  api.add('JWLUSD-62939e', data3.minted - data3.burnt)
  return sumTokens({ owners: [JWLASH_STAKING], balances: api.getBalances() })
}

async function radixTvl(api) {
  return radixdlt.sumTokens({ owner: RADIX_COMPONENT, api, transformLSU: true })
}

module.exports = {
  doublecounted: true,
  elrond: { tvl: elrondTvl },
  sui: { tvl: suiTvl },
  radixdlt: { tvl: radixTvl },
}
