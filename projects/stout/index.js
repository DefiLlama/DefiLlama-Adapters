// Stout Protocol Adapter for DeFiLlama
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

const tokens = {
    // Basic tokens
    STTX: '0x97a10beEbB25e0eBfA55Ca0A7d00E37AFe957DEa',
    veSTTX: '0x8221312e9cF90A2B160eCdabf922408a5ef1CF9E',
    DUSX: '0xe30e73Cc52EF50A4E4a8b1a3dd0b002b2276F854',
    USDC: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
    USDT: '0x6047828dc181963ba44974801FF68e538dA5eaF9',
    
    // Additional vault tokens
    wS: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
    stS: '0xE5DA20F15420aD15DE0fa650600aFc998bbE3955',
    wOS: '0x9F0dF7799f6FDAd409300080cfF680f5A23df4b1',
    wanS: '0xfA85Fe5A8F5560e9039C04f2b0a90dE1415aBD70',
    EGGS: '0xf26Ff70573ddc8a90Bd7865AF8d7d70B8Ff019bC',
    WETH: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b',
    WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    LBTC: '0xecAc9C5F704e954931349Da37F60E39f515c11c1',
    SolvBTC: '0x541FD749419CA806a8bc7da8ac23D346f2dF8B77',
    scUSD: '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
    scETH: '0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812',
    scBTC: '0xBb30e76d9Bb2CC9631F7fC5Eb8e87B5Aff32bFbd',
    wstkscUSD: '0x9fb76f7ce5FCeAA2C42887ff441D46095E494206',
    wstkscETH: '0xE8a41c62BB4d5863C6eadC96792cFE90A1f37C47',
    SHADOW: '0x3333b97138D4b086720b5aE8A7844b1345a33333',
    Anon: '0x79bbF4508B1391af3A0F4B30bb5FC4aa9ab0E07C',
};

const contracts = {
    StakedDUSX: '0xa0B0CbffEd77E57E946FB1fb875b28eDd0d0CC6D',
    VoteEscrowedSTTX: '0x8221312e9cF90A2B160eCdabf922408a5ef1CF9E',
    StoutVault: '0x88d6D8547Bcbd5366538cEdCCF424776f3f7CABF',
    LenderVoteEscrowedSTTX: '0x40E0fAA1FF6E73e2955266c1b897FC3545Ad4C48',
    LenderWS: '0x711de8e2FB625c523e0954F9948d090b8f584A62',
    LenderWETH: '0xF55e1E569Da5F02998BF98ED6BEbdCdA661c1a91',
    PegStabilityModuleUSDC: '0x24E2A86176F209CcE828714c48f804fd7444A89a',
    PegStabilityModuleUSDT: '0xB969195dB5d756AC7a7EA78a69F20Fe1f172a494',
    Floor: '0xb8c30cF1aA46b4E8eE8D008A0F2F763B3D5baC0e',
    MarketLens: '0x56F0B188fEa4cD50EC91Faa15982dF9D9017db48',
};



// Calculates TVL from StoutVault, PSMs, and Floor
async function tvl(api) {
    const tokensAndOwners = [];

    // Add all vault tokens
    for (const [_, tokenAddress] of Object.entries(tokens)) {
        tokensAndOwners.push([tokenAddress, contracts.StoutVault]);
    }

    // PSM tokens
    tokensAndOwners.push([tokens.USDC, contracts.PegStabilityModuleUSDC]);
    tokensAndOwners.push([tokens.USDT, contracts.PegStabilityModuleUSDT]);

    // Floor tokens
    tokensAndOwners.push([tokens.DUSX, contracts.Floor]);

    // Get all balances first
    const balances = await sumTokens2({ api, tokensAndOwners });
    
    return balances;
}

// Calculates staked STTX and DUSX
async function staking(api) {
    const tokensAndOwners = [
        [tokens.STTX, contracts.VoteEscrowedSTTX],
        [tokens.DUSX, contracts.StakedDUSX],
    ];

    const balances = await sumTokens2({ api, tokensAndOwners });
    
    return balances;
}

// No LP tokens in the current implementation
async function pool2(api) {
    return {};
}

// Gets borrowed DUSX amount from the MarketLens contract
async function borrowed(api) {
    try {
        // Explicit ABI for the MarketLens contract function
        const abi = 'function getTotalBorrowed(address lender) external view returns (uint256)';
        
        // List of lenders to check
        const lenders = [
            contracts.LenderVoteEscrowedSTTX,
            contracts.LenderWS,
            contracts.LenderWETH
        ];
        
        // Get borrowed amounts from all lenders
        for (const lender of lenders) {
            try {
                const borrowedAmount = await api.call({
                    abi,
                    target: contracts.MarketLens,
                    params: [lender],
                });
                api.add(tokens.DUSX, borrowedAmount);
            } catch (lenderError) {
                console.log(`Error getting borrowed amount for lender ${lender}: ${lenderError.message}`);
                // Continue with other lenders if one fails
            }
        }
        
        return api.getBalances();
    } catch (error) {
        console.log(`Error in borrowed function: ${error.message}`);
        return {};
    }
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    doublecounted: false,
    methodology:
        'TVL includes various tokens in StoutVault, stablecoins in PSMs, and DUSX in Floor. ' +
        'Staking tracks STTX in VoteEscrowedSTTX and DUSX in StakedDUSX. ' +
        'Borrowed shows DUSX loans from Lenders.',
    sonic: {
        tvl,
        staking,
        pool2,
        borrowed,
    },
};
