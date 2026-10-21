const { sumTokens2 } = require('../helper/unwrapLPs')

// URM -- CDP stablecoin on Base (UltraRound Money)
// TVL = user collateral backing URM, held in the per-collateral CDP adapter
// contracts. Protocol-owned Fortress reserves are tracked in treasury/urm.js.
// URM itself is excluded.

const RAGE = '0xc0df50143EA93AeC63e38A6ED4E92B378079eA15'
const HESTIA = '0xBC7755a153E852CF76cCCDdb4C2e7c368f6259D8'
const ULTRAROUND = '0x5baBfc2F240bc5De90Eb7e19D789412dB1dEc402' // CIRCLE

// [collateral token, CDP collateral adapter holding it]
const CDP_COLLATERAL = [
  [RAGE, '0x099072418d0100ff2ced5598f97d42b96f8ea7fe'],
  [HESTIA, '0xce76cb3239fcb25fd4814c8a4abc563b4ac74c1e'],
  [ULTRAROUND, '0x0db24c8674cda319e18a5e81fc960b0a2a30a3b1'],
]

async function tvl(api) {
  return sumTokens2({ api, tokensAndOwners: CDP_COLLATERAL })
}

module.exports = {
  methodology:
    'TVL is the collateral users have deposited into URM CDP positions (RAGE, HESTIA, Ultraround), held in the per-collateral adapter contracts. URM itself is excluded. Protocol-owned reserves in the Fortress are tracked as treasury.',
  base: { tvl },
}