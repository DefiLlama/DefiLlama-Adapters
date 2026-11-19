const { sumERC4626VaultsExport2 } = require('../helper/erc4626')
const sui = require('../helper/chain/sui')

const RCUSDP_STAKING_POOL = '0x64202e28c99a2036134788b750d3223b02f9b3c29b603e3e21e60a41289e395f'
const RCUSD_DECIMALS = 6

const pharosVaults = [
  '0x1c2bc8b553d9a7e61f7531a3a4bf2162f4569268', // vRPCWeeklyVault
  '0x94f7ebc6ae0819a4b4e231ae6ddaaf9bfd2a1a86', // vRPCQuarterlyVault
  '0xee26bb0989691735c997dfdc49a4a607f75e190b', // vRPCSemiYearlyVault
  '0x39976f3Ef143a5824d4E4c28c204d556113dCF7f', // pCreditVault
  '0xd0428799fbc35557834d33121ba4472692c8908a', // apcVault
  '0x6Ce4bc043398Ac40392d1E063328048072b2075d', // hybVault
  '0x921974d7b1a2dbaccaf5ba893a3a1500638cea6b', // axilpot
]

// rcUSD total supply includes unstaked tokens, so vault TVL is PoolInner.staked.
async function tvl(api) {
  const pool = await sui.getObject(RCUSDP_STAKING_POOL)
  const versioned = pool.fields.inner.fields
  const inner = await sui.getDynamicFieldObject(versioned.id.id, versioned.version, { idType: 'u64' })
  api.addUSDValue(Number(inner.fields.value.fields.staked) / 10 ** RCUSD_DECIMALS)
}

module.exports = {
  methodology: 'TVL represents the total value of assets held within the vault. Each vault token is minted using USDC and appreciates in line with the performance of the underlying asset. On Sui, TVL is rcUSD locked in the rcUSDp staking vault, valued at the rcUSD face value of 1 USD.',
  pharos: { tvl: sumERC4626VaultsExport2({ vaults: pharosVaults }) },
  sui: { tvl },
}
