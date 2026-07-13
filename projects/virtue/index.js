const iota = require('../helper/chain/iota')
const { getAllVaults } = require("./utils")

// Swirl stIOTA (CERT) exchange-rate objects
const CERT_NATIVE_POOL = '0x02d641d7b021b1cd7a2c361ac35b415ae8263be0641f9475ec32af4b9d8a8056'
const CERT_METADATA = '0x8c25ec843c12fbfddc7e25d66869f8639e20021758cac1a3db0f6de3c9fda2ed'
// vIOTA (vCERT) exchange-rate objects
const VCERT_NATIVE_POOL = '0xb435fa61ee8d5473ab36de02c88756f8c74fcc031b4e3a2fe2a6647bb06b2872'
const VCERT_METADATA = '0xb45b32d8d58c6499795036faa92b0561c6df089cdd4fc6ae8a0543981a698bf1'

// IOTA-per-CERT rate = (staked + rewards) / supply; falls back to 1 on any anomaly
async function getIotaPerCert(nativePoolId, metadataId) {
  try {
    const nativePool = await iota.getObject(nativePoolId)
    const metadata = await iota.getObject(metadataId)
    const supply = Number(BigInt(metadata.fields.total_supply.fields.value))
    const staked = Number(BigInt(nativePool.fields.total_staked))
    const rewards = Number(BigInt(nativePool.fields.total_rewards ?? 0))
    if (!supply || !(staked + rewards)) return 1
    return (staked + rewards) / supply
  } catch (e) {
    return 1 // conservative 1:1 fallback rather than zeroing the adapter
  }
}

async function tvl() {
  const vaults = await getAllVaults()

  const human = (v) =>
    v?.collateralBalance ? Number(v.collateralBalance) / 10 ** v.collateralDecimal : 0

  let iotaTotal = human(vaults.IOTA)

  if (human(vaults.stIOTA)) {
    const rate = await getIotaPerCert(CERT_NATIVE_POOL, CERT_METADATA)
    iotaTotal += human(vaults.stIOTA) * rate
  }
  if (human(vaults.vIOTA)) {
    const rate = await getIotaPerCert(VCERT_NATIVE_POOL, VCERT_METADATA)
    iotaTotal += human(vaults.vIOTA) * rate
  }

  const balances = { iota: iotaTotal }

  // iBTC is BTC-pegged (Pyth BTC/USD feed in the protocol oracle config)
  const ibtcAmount = human(vaults.iBTC)
  if (ibtcAmount) balances.bitcoin = ibtcAmount

  return balances
}

module.exports = {
  methodology:
    "Sums collateral (IOTA, stIOTA, iBTC, vIOTA) held in Virtue CDP vault objects. LST collateral is converted to IOTA using the on-chain staking exchange rate; iBTC is priced as BTC.",
  timetravel: false,
  iota: {
    tvl,
  },
}
