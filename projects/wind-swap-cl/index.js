const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

// Wind Swap - Velodrome/Aerodrome style DEX on Sei
// CL Factory: 0xA0E081764Ed601074C1B370eb117413145F5e8Cc
// VotingEscrow: 0x9312A9702c3F0105246e12874c4A0EdC6aD07593
// WIND Token: 0x80B56cF09c18e642DC04d94b8AD25Bb5605c1421

module.exports = {
    misrepresentedTokens: true,
    methodology: "TVL includes liquidity in Slipstream CL pools, staking includes WIND locked in veWIND (VotingEscrow) for voting rewards.",
    sei: {
        tvl: getUniTVL({
            factory: '0xA0E081764Ed601074C1B370eb117413145F5e8Cc',
            fetchBalances: true,
            abis: {
                allPairsLength: 'uint256:allPoolsLength',
                allPairs: "function allPools(uint) view returns (address)",
            }
        }),
        // WIND locked in VotingEscrow for veWIND (vote-escrowed WIND)
        staking: staking(
            "0x9312A9702c3F0105246e12874c4A0EdC6aD07593", // VotingEscrow contract
            "0x80B56cF09c18e642DC04d94b8AD25Bb5605c1421"  // WIND token
        ),
    }
}
