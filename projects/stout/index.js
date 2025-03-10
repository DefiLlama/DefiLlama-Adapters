// Stout Protocol Adapter for DeFiLlama
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

const tokens = {
    DUSX: '0xe30e73Cc52EF50A4E4a8b1a3dd0b002b2276F854',
    STTX: '0x97a10beEbB25e0eBfA55Ca0A7d00E37AFe957DEa',
    USDC: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
    USDT: '0x6047828dc181963ba44974801FF68e538dA5eaF9',
    veSTTX: '0x8221312e9cF90A2B160eCdabf922408a5ef1CF9E',
};

const contracts = {
    StakedDUSX: '0xa0B0CbffEd77E57E946FB1fb875b28eDd0d0CC6D',
    VoteEscrowedSTTX: '0x8221312e9cF90A2B160eCdabf922408a5ef1CF9E',
    StoutVault: '0x88d6D8547Bcbd5366538cEdCCF424776f3f7CABF',
    LenderVoteEscrowedSTTX: '0x40E0fAA1FF6E73e2955266c1b897FC3545Ad4C48',
    PegStabilityModuleUSDC: '0x24E2A86176F209CcE828714c48f804fd7444A89a',
    PegStabilityModuleUSDT: '0xB969195dB5d756AC7a7EA78a69F20Fe1f172a494',
    Floor: '0xb8c30cF1aA46b4E8eE8D008A0F2F763B3D5baC0e',
    MarketLens: '0x56F0B188fEa4cD50EC91Faa15982dF9D9017db48',
};

// Maps tokens for pricing: veSTTX → STTX and DUSX → USDC (with 18 → 6 decimal conversion)
function mapTokens(balances) {
    // If we have veSTTX tokens, map them to STTX (same price)
    // Both tokens have 18 decimals, so no scaling needed
    if (balances[`sonic:${tokens.veSTTX.toLowerCase()}`]) {
        const veSTTXBalance = balances[`sonic:${tokens.veSTTX.toLowerCase()}`];
        delete balances[`sonic:${tokens.veSTTX.toLowerCase()}`];
        sdk.util.sumSingleBalance(balances, `sonic:${tokens.STTX.toLowerCase()}`, veSTTXBalance);
    }
    
    // If we have DUSX tokens, map them to USDC (swaps 1:1 in the PSM)
    // DUSX has 18 decimals while USDC has 6, need to scale by 10^12
    if (balances[`sonic:${tokens.DUSX.toLowerCase()}`]) {
        const DUSXBalance = balances[`sonic:${tokens.DUSX.toLowerCase()}`];
        delete balances[`sonic:${tokens.DUSX.toLowerCase()}`];
        
        // Convert from 18 decimals to 6 decimals (divide by 10^12)
        const SCALING_FACTOR = 1_000_000_000_000;
        const scaledDUSXBalance = DUSXBalance / SCALING_FACTOR;
        sdk.util.sumSingleBalance(balances, `sonic:${tokens.USDC.toLowerCase()}`, scaledDUSXBalance);
    }
    
    return balances;
}

// Calculates TVL from StoutVault, PSMs, and Floor
async function tvl(api) {
    const tokensAndOwners = [];

    // Vault tokens
    tokensAndOwners.push([tokens.DUSX, contracts.StoutVault]);
    tokensAndOwners.push([tokens.veSTTX, contracts.StoutVault]);

    // PSM tokens
    tokensAndOwners.push([tokens.USDC, contracts.PegStabilityModuleUSDC]);
    tokensAndOwners.push([tokens.USDT, contracts.PegStabilityModuleUSDT]);

    // Floor tokens
    tokensAndOwners.push([tokens.DUSX, contracts.Floor]);

    // Get all balances first
    const balances = await sumTokens2({ api, tokensAndOwners });
    
    // Apply token mapping for pricing
    return mapTokens(balances);
}

// Calculates staked STTX and DUSX
async function staking(api) {
    const tokensAndOwners = [
        [tokens.STTX, contracts.VoteEscrowedSTTX],
        [tokens.DUSX, contracts.StakedDUSX],
    ];

    const balances = await sumTokens2({ api, tokensAndOwners });
    
    // Apply token mapping for pricing
    return mapTokens(balances);
}

// No LP tokens in the current implementation
async function pool2(api) {
    return {};
}

// Gets borrowed DUSX amount (mapped to USDC) from the MarketLens contract
async function borrowed(api) {
    try {
        // Explicit ABI for the MarketLens contract function
        const abi = 'function getTotalBorrowed(address lender) external view returns (uint256)';
        
        // Call MarketLens.getTotalBorrowed for accurate borrowed amount with accrued interest
        const totalBorrowed = await api.call({
            abi,
            target: contracts.MarketLens,
            params: [contracts.LenderVoteEscrowedSTTX],
        });
        
        // Add DUSX amount (convert to USDC immediately for pricing)
        const SCALING_FACTOR = 1_000_000_000_000; // 10^12 for conversion from 18 to 6 decimals
        api.add(tokens.USDC, totalBorrowed / SCALING_FACTOR);
        return api.getBalances();
    } catch (error) {
        // Return empty balances if the call fails
        return {};
    }
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    doublecounted: false,
    methodology:
        'TVL includes tokens in StoutVault, stablecoins in PSMs, and DUSX in Floor. ' +
        'Staking tracks STTX in VoteEscrowedSTTX and DUSX in StakedDUSX. ' +
        'Borrowed shows DUSX loans from the Lender. ' +
        'For pricing: veSTTX uses STTX price, and DUSX (18 decimals) is mapped to USDC (6 decimals) since it swaps 1:1 in the PSM.',
    sonic: {
        tvl,
        staking,
        pool2,
        borrowed,
    },
};
