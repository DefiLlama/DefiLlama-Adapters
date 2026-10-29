const ADDRESSES = require('../helper/coreAssets.json')
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
    'not counted. Fees owed to the treasury (protocolFxrp) are excluded.',
  // Jar deploy: 2026-10-26 21:59:28 UTC, block 73048463. A timestamp, not '2026-10-26': at midnight that day the
  // Jar did not exist yet and the first backfill day would fail.
  start: 1793051968,
  flare: {
    tvl,
  },
}
