const { get } = require('../helper/http')

// Hatom's TAO Bridge custodies native TAO on Bittensor and mints WrappedTAO
// (WTAO-4f5363) 1:1 on MultiversX. The Bittensor-side custody is an
// unpublished, rotating multi-wallet set: the treasury this adapter used to
// read (5HZAAREP...) now holds ~0.09 TAO, its successor was dispersed across
// several wallets, and bridge-back payouts run through a 2-of-3 multisig.
// Custody-side accounting therefore goes stale by design; the circulating
// wrapped supply (minted minus burnt, 9 decimals) is the stable measure of
// TAO locked, and is read from the public MultiversX API with no key.
const TOKEN_API = 'https://api.multiversx.com/tokens/WTAO-4f5363'
const RAO = 1_000_000_000n

/**
 * Reads the circulating WrappedTAO supply (minted minus burnt, 9 decimals)
 * from the public MultiversX API and reports it as TAO locked in the bridge.
 */
async function tvl(api) {
  const t = await get(TOKEN_API, { timeout: 30_000 })
  // Fail loudly on a malformed/changed API response rather than crashing on
  // BigInt(undefined) with no context.
  if (t?.minted == null || t?.burnt == null) {
    throw new Error(`WTAO token response missing minted/burnt: ${JSON.stringify(t).slice(0, 200)}`)
  }
  const raoLocked = BigInt(t.minted) - BigInt(t.burnt)
  // burnt > minted would mean a broken bridge; never report negative TVL.
  if (raoLocked < 0n) {
    throw new Error(`negative locked amount: minted ${t.minted} < burnt ${t.burnt}`)
  }
  api.addCGToken('bittensor', Number(raoLocked / RAO) + Number(raoLocked % RAO) / 1e9)
}

module.exports = {
  timetravel: false,
  methodology:
    'TAO locked in the bridge, measured as the circulating WrappedTAO (WTAO-4f5363) supply on MultiversX (minted minus burnt), which the bridge backs 1:1 with native TAO custodied on Bittensor. The Bittensor-side custody wallets rotate and are not published, so the wrapped supply is the reliable measure of the locked amount.',
  bittensor: {
    tvl,
  },
}
