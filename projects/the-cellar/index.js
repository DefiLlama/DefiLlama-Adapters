const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
// DefiLlama TVL adapter for The Cellar by FlareCat (Flare), https://flarecellar.xyz
//
// Not related to Sommelier, whose vaults are also called "cellars". This is a separate protocol on
// Flare with its own team and contracts.
//
// One FXRP reserve, held by a single contract (the Jar), with claims on it:
//   - fcUSD : dollar-sized game token minted against the reserve
//   - Boost : leveraged XRP exposure on the same reserve (owns what is left after fcUSD)
//   - Den   : holds fcUSD and turns it into FXRP when backing gets thin
//   - KOBAN : points token
// fcUSD, Boost, Den shares and KOBAN are claims or points on the same FXRP, so none of them is
// counted. The Jar's FXRP balance is counted as held, including fees not yet collected by the treasury.
// fcUSD held by the Jar (Den fcUSD, swap-back escrow) is a claim, not collateral, and is not counted.

const JAR = '0xF85d0daCC7e911b1a2800DCF0e6027e0f7481294'

// XRP Options (since 2026-11-05): the Premium Vault (verified source, XrpCalls.sol) holds the USDT0 that backs every
// call and put it sells. Its USDT0 balance is counted as held.
const PREMIUM_VAULT = '0x323A173373f2653eBB23139163b8231aD2a91129'

// cKOBAN (since 2026-11-01): KOBAN, the protocol's own points token, wrapped into cKOBAN (verified source, Cask.sol), and
// a farm that stakes the SparkDEX V2 cKOBAN/FXRP LP (CaskFarm.sol). Both are the protocol's own token, so they are
// reported apart from TVL: the KOBAN held by cKOBAN as staking, the staked cKOBAN/FXRP LP as pool2.
const KOBAN = '0xC66E0d44BaC9C58C19083d57c6431BDB405aC027'
const CKOBAN = '0x02B203690B0D9D0A03F28bdf7794D95da01cB68c'
const CKOBAN_FARM = '0x31BF74580AD232220C09829Ec29168a00a877f42'
const CKOBAN_FXRP_LP = '0x9396Bd1b043c1e37adF0d6c32492B44Fc5707928'

async function tvl(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [ADDRESSES.flare.FXRP, JAR],
      [ADDRESSES.flare.USDT0, PREMIUM_VAULT],
    ],
  })
}

module.exports = {
  methodology:
    'TVL is the FXRP held by the Jar contract, which backs fcUSD and Boost and holds the FXRP owned by Den ' +
    'depositors, and the USDT0 held by the XRP Options Premium Vault, which backs the calls and puts it sells. ' +
    'fcUSD, Boost, Den shares and KOBAN are claims or points on that same FXRP and are not counted. Staking: the ' +
    'KOBAN held by cKOBAN (KOBAN wrapped by its holders). Pool2: the SparkDEX V2 cKOBAN/FXRP LP staked in the cKOBAN farm.',
  // Jar deploy: 2026-10-26 21:59:28 UTC, block 73048463. A timestamp, not '2026-10-26': at midnight that day the
  // Jar did not exist yet and the first backfill day would fail.
  start: 1793051968,
  flare: {
    tvl,
    staking: staking(CKOBAN, KOBAN),
    pool2: pool2(CKOBAN_FARM, CKOBAN_FXRP_LP),
  },
}
