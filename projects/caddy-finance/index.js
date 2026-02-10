/**
 * Caddy Finance - Bitcoin Yield Vault Protocol
 *
 * Caddy Finance is a yield vault protocol for Bitcoin derivatives, enabling institutions
 * and holders to earn structured, bitcoin-native yields on wrapped BTC assets through
 * automated, institutional-grade strategies.
 *
 * Website: https://caddy.finance/
 * Twitter: @caddyfi
 * GitHub: https://github.com/caddyfinance
 * Category: Yield/Vault
 */

const {multiCall} = require("../helper/chain/starknet");
const ADDRESSES = require('../helper/coreAssets.json');
const { tBTCVaultABIMap } = require('./tBTCVaultABIMap');

// Starknet vaults
const STARKNET_VAULTS = [
    {
        address: "0x306dcfa0a08166fd52292afa8e30f10df36dda1b2e338eb8f579936aeefd082", // Primary tBTC vault
        token: ADDRESSES.starknet.TBTC
    }
]

// Starknet TVL
async function starknetTvl(api) {
    // Get total tBTC collateral locked in Vesu protocol
    const vesuCollateral = await multiCall({
        calls: STARKNET_VAULTS.map(c => c.address),
        abi: tBTCVaultABIMap['get_vesu_collateral'],
        chain: 'starknet',
    });

    for (let i = 0; i < STARKNET_VAULTS.length; i++) {
        api.addCGToken('bitcoin', vesuCollateral[i] / 1e18);
    }
}

// Starknet Revenue (Protocol Fees)
// Calculates fees from cycle yields (treasury + management fees)
async function starknetRevenue(api) {

    // Get fee percentages (in basis points)
    const treasuryFeeBps = await multiCall({
        calls: STARKNET_VAULTS.map(c => c.address),
        abi: tBTCVaultABIMap['get_treasury_fee_bps'],
        chain: 'starknet',
    });

    const managementFeeBps = await multiCall({
        calls: STARKNET_VAULTS.map(c => c.address),
        abi: tBTCVaultABIMap['get_management_fee_bps'],
        chain: 'starknet',
    });

    // For each vault, calculate fees from cycle yield
    for (let i = 0; i < STARKNET_VAULTS.length; i++) {
        const vault = STARKNET_VAULTS[i];
        const cycleId = currentCycles[i];

        // Get yield for current cycle
        const cycleYield = await multiCall({
            calls: [{ target: vault.address, params: [cycleId] }],
            abi: tBTCVaultABIMap['get_cycle_yield'],
            chain: 'starknet',
        });

        // Calculate total fees (treasury + management)
        const totalFeeBps = Number(treasuryFeeBps[i]) + Number(managementFeeBps[i]);
        const feeAmount = (BigInt(cycleYield[0]) * BigInt(totalFeeBps)) / BigInt(10000);

        // Add fees as revenue
        api.add(vault.token, feeAmount);
    }
}

// Starknet Users (Active Participants in Current Cycle)
// Tracks the number of unique participants in the active yield cycle
async function starknetUsers(api) {
    // Get current cycle for each vault
    const currentCycles = await multiCall({
        calls: STARKNET_VAULTS.map(c => c.address),
        abi: tBTCVaultABIMap['get_current_cycle'],
        chain: 'starknet',
    });

    let totalActiveUsers = 0;

    // For each vault, get participant count
    for (let i = 0; i < STARKNET_VAULTS.length; i++) {
        const participants = await multiCall({
            calls: [{ target: STARKNET_VAULTS[i].address, params: [currentCycles[i]] }],
            abi: tBTCVaultABIMap['get_participants_count'],
            chain: 'starknet',
        });

        totalActiveUsers += Number(participants[0]);
    }

    return totalActiveUsers;
}

module.exports = {
    doublecounted: true,
    methodology: "TVL is the total tBTC collateral locked in Vesu protocol by Caddy Finance vaults (via get_vesu_collateral). Revenue tracks protocol fees calculated from cycle yields (treasury + management fees). Users metric counts active participants in current yield cycles. The protocol focuses on Bitcoin-native yields through wrapped BTC assets (WBTC, tBTC, wcBTC) using automated, institutional-grade strategies.",
    starknet: {
        tvl: starknetTvl,
        // revenue: starknetRevenue,  // Protocol fees from cycle yields
        // users: starknetUsers,       // Active participants in current cycle
    },
};