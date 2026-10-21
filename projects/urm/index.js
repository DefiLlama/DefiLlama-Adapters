const { sumTokens2 } = require('../helper/unwrapLPs')

// URM -- CDP stablecoin on Base (UltraRound Money)
//
// TVL = the collateral backing URM:
//   1. CDP collateral, held in the three CDP collateral adapter contracts
//      (RAGE, HESTIA, Ultraround)
//   2. Fortress reserves: tokens the Fortress holds directly, plus the USDC
//      side of its Uniswap V3 URM/USDC position(s)
//
// URM itself, and fURM (the Fountain vault share), are excluded everywhere.
// The Fortress reports CDP loans internally as usdcStored; that is bookkeeping,
// not a token balance, so counting balances cannot double count it.

const URM = '0xf0e3349f00972475a5d16721796091aa3b997837'
const FURM = '0x95fa3FA511Ef8DD9e48453eaE76b241D1c1AC651'
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const RAGE = '0xc0df50143EA93AeC63e38A6ED4E92B378079eA15'
const HESTIA = '0xBC7755a153E852CF76cCCDdb4C2e7c368f6259D8'
const ULTRAROUND = '0x5baBfc2F240bc5De90Eb7e19D789412dB1dEc402'

const CDP_COLLATERAL_ADAPTERS = [
  '0x099072418d0100ff2ced5598f97d42b96f8ea7fe', // RAGE collateral
  '0xce76cb3239fcb25fd4814c8a4abc563b4ac74c1e', // HESTIA collateral
  '0x0db24c8674cda319e18a5e81fc960b0a2a30a3b1', // Ultraround collateral
]
const FORTRESS = '0xd3e9637Cfc255AD3FffA1e88Bd9BA7fa5a76b4Fe'

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [...CDP_COLLATERAL_ADAPTERS, FORTRESS],
    tokens: [RAGE, HESTIA, ULTRAROUND, USDC],
    resolveUniV3: true, // unwraps the Fortress URM/USDC position
    blacklistedTokens: [URM, FURM],
  })
}

module.exports = {
  methodology:
    'TVL is the collateral backing URM: tokens deposited as collateral in the URM CDP (RAGE, HESTIA, Ultraround), plus the reserves held by the Fortress, the protocol contract that backs URM and defends its peg (tokens held directly and the USDC side of its Uniswap V3 URM/USDC position). URM itself and fURM are excluded.',
  base: { tvl },
}
