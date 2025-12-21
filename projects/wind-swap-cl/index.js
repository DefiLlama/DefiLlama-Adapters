const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

// Wind Swap - Velodrome/Aerodrome style DEX on Sei
// CL Factory: 0x0aeEAf8d3bb4a9466e6AC8985F5173ddB42Ec081
// VotingEscrow: 0xE0d5DCB4D4Afc0f9Ab930616F4f18990ee17519b
// WIND Token: 0x188E342cdEDd8FdF84D765Eb59B7433D30F5484D

module.exports = {
    misrepresentedTokens: true,
    methodology: "TVL includes liquidity in Slipstream CL pools, staking includes WIND locked in veWIND (VotingEscrow) for voting rewards.",
    sei: {
        tvl: getUniTVL({
            factory: '0x0aeEAf8d3bb4a9466e6AC8985F5173ddB42Ec081',
            fetchBalances: true,
            abis: {
                allPairsLength: 'uint256:allPoolsLength',
                allPairs: "function allPools(uint) view returns (address)",
            }
        }),
        // WIND locked in VotingEscrow for veWIND (vote-escrowed WIND)
        staking: staking(
            "0xE0d5DCB4D4Afc0f9Ab930616F4f18990ee17519b", // VotingEscrow contract
            "0x188E342cdEDd8FdF84D765Eb59B7433D30F5484D"  // WIND token
        ),
    }
}
