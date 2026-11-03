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
// counted. Only FXRP the Jar actually holds for users is counted.
//
// The Jar keeps its FXRP in three internal ledgers (verified source, Jar.sol):
//   reserve      FXRP backing fcUSD + Boost                          -> counted
//   denFxrp      FXRP owned by Den depositors (after a conversion)   -> counted
//   protocolFxrp fees owed to the treasury, paid out by collect()    -> NOT counted
// FXRP sent to the Jar outside these ledgers is ignored by its accounting and is not counted either.
// fcUSD held by the Jar (Den fcUSD, swap-back escrow) is a claim, not collateral, and is not counted.

const JAR = '0xF85d0daCC7e911b1a2800DCF0e6027e0f7481294'

// cKOBAN (since 2026-11-01): KOBAN, the protocol's own points token, wrapped into cKOBAN (verified source, Cask.sol), and
// a farm that stakes the SparkDEX V2 cKOBAN/FXRP LP (CaskFarm.sol). Both are the protocol's own token, so they are
// reported apart from TVL: the KOBAN held by cKOBAN as staking, the staked cKOBAN/FXRP LP as pool2.
const KOBAN = '0xC66E0d44BaC9C58C19083d57c6431BDB405aC027'
const CKOBAN = '0x02B203690B0D9D0A03F28bdf7794D95da01cB68c'
const CKOBAN_FARM = '0x31BF74580AD232220C09829Ec29168a00a877f42'
const CKOBAN_FXRP_LP = '0x9396Bd1b043c1e37adF0d6c32492B44Fc5707928'

async function tvl(api) {
  const [reserve, denFxrp] = await Promise.all([
    api.call({ target: JAR, abi: 'uint256:reserve' }),
    api.call({ target: JAR, abi: 'uint256:denFxrp' }),
  ])
  api.add(ADDRESSES.flare.FXRP, reserve)
  api.add(ADDRESSES.flare.FXRP, denFxrp)
}

module.exports = {
  methodology:
    'TVL is the FXRP held in the Jar contract for users: the reserve that backs fcUSD and Boost plus the FXRP ' +
    'owned by Den depositors. fcUSD, Boost, Den shares and KOBAN are claims or points on that same FXRP and are ' +
    'not counted. Fees owed to the treasury (protocolFxrp) are excluded. Staking: the KOBAN held by cKOBAN (KOBAN ' +
    'wrapped by its holders). Pool2: the SparkDEX V2 cKOBAN/FXRP LP staked in the cKOBAN farm.',
  // Jar deploy: 2026-10-26 21:59:28 UTC, block 73048463. A timestamp, not '2026-10-26': at midnight that day the
  // Jar did not exist yet and the first backfill day would fail.
  start: 1793051968,
  flare: {
    tvl,
    staking: staking(CKOBAN, KOBAN),
    pool2: pool2(CKOBAN_FARM, CKOBAN_FXRP_LP),
  },
}
