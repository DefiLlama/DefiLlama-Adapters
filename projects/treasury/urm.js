const { treasuryExports } = require('../helper/treasury')

// URM treasury: protocol-owned reserves in the Fortress, the contract that
// backs URM and defends its peg. Includes tokens held directly and its
// Uniswap V3 URM/USDC position (URM side excluded).

const FORTRESS = '0xd3e9637Cfc255AD3FffA1e88Bd9BA7fa5a76b4Fe'
const URM = '0xf0e3349f00972475a5d16721796091aa3b997837'
const FURM = '0x95fa3FA511Ef8DD9e48453eaE76b241D1c1AC651'
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const RAGE = '0xc0df50143EA93AeC63e38A6ED4E92B378079eA15'
const HESTIA = '0xBC7755a153E852CF76cCCDdb4C2e7c368f6259D8'
const ULTRAROUND = '0x5baBfc2F240bc5De90Eb7e19D789412dB1dEc402' // CIRCLE

module.exports = treasuryExports({
  base: {
    owners: [FORTRESS],
    tokens: [USDC, RAGE, HESTIA, ULTRAROUND],
    resolveUniV3: true,
    blacklistedTokens: [URM, FURM],
    fetchCoValentTokens: false,
  },
})