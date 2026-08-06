// ============================================================================
// DGLD (Digital Gold) — DefiLlama TVL adapter — V2
// File location in the repo: projects/dgld/index.js
// ============================================================================
//
// WHY A V2 / WHAT THIS FIXES
// ----------------------------------------------------------------------------
// The adapter currently live on DefiLlama (merged Jan 2026, PR #17739 by
// GitHub user RohanNero — an independent open-source contributor, not a
// GTSA/DGLD team member) only tracks Ethereum, and its methodology comment
// says:
//
//   "All tokens are minted on L1 (Ethereum); L2 tokens represent locked L1
//    tokens, so L1 total supply accounts for all value."
//
// That was accurate under the OLD Base bridging model, where Base DGLD was
// just a 1:1 bridged mirror of the Ethereum supply (so counting Ethereum
// alone was enough — counting Base too would have double-counted the same
// gold).
//
// Since GTSA's Base migration (contract redeployed to
// 0xe908475f8Beb7A138B0dc6eb5A05cb27068ffB9A), Base no longer bridges from
// Ethereum: it has its OWN dedicated, independently gold-backed supply (a new
// bar is placed in the vault and minted directly on Base). The old adapter
// therefore now UNDER-COUNTS total TVL, because it only sees the Ethereum
// supply and ignores the Base-native supply entirely. It also has no Solana
// support at all, since DGLD only launched there after this adapter was
// written.
//
// This V2 keeps the original Ethereum logic completely untouched (it was
// already correct and matches the DefiLlama-native pattern used for other
// gold-backed tokens such as PAXG — see projects/paxos-gold/index.js), and
// adds:
//   1. Base: same on-chain totalSupply pattern, new dedicated-supply contract.
//   2. Solana: new dedicated-supply mint, read via the repo's real exported
//      helper `getTokenSupplies` from projects/helper/solana.js (NOT
//      `getTokenSupply`, singular — that function does not exist and was an
//      earlier, incorrect assumption, caught by cross-checking the actual
//      helper file before writing this version).
//   3. An updated methodology string that reflects the current multi-chain,
//      dedicated-supply-per-chain reality instead of the outdated bridging
//      assumption.
//
// STILL UNVERIFIED — DO NOT SUBMIT A PR UNTIL THIS IS CONFIRMED:
// ----------------------------------------------------------------------------
// Whether DefiLlama's pricing layer already resolves a USD price for the
// Solana mint below purely from its address (it does for the Ethereum/Base
// contracts, since those are long-established and already priced). Run:
//
//     node test.js projects/dgld
//
// If the Solana leg comes back as an "unknown token" / unpriced, this
// adapter needs a different pricing approach for that chain — re-check with
// a person or the repo's adapter-author skill first, do not guess a fix.
// ============================================================================

// One DGLD token corresponds to one fine troy ounce
// of fully allocated, audited gold held in Swiss custody.
const DGLD_TOKEN = '0xA9299C296d7830A99414d1E5546F5171fA01E9c8';
const DGLD_BASE = '0xe908475f8Beb7A138B0dc6eb5A05cb27068ffB9A';

const { getTokenSupplies } = require('../helper/solana')
const SOLANA_MINT = 'dg1dmo6NZNagkwB6EAfUeaco6CFXFLRhb1KCrsqXTVz'

async function ethereumTvl(api) {
    const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: DGLD_TOKEN,
    });

    api.add(DGLD_TOKEN, totalSupply);
}

async function baseTvl(api) {
    const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: DGLD_BASE,
    });

    api.add(DGLD_BASE, totalSupply);
}

async function solanaTvl(api) {
    await getTokenSupplies([SOLANA_MINT], { api })
}

module.exports = {
    methodology: 'Calculates TVL by multiplying the total DGLD supply on each chain by the token price. Each DGLD token represents 1 troy ounce of allocated, audited gold held in Swiss custody. Following the Base migration, each chain now has its own dedicated, independently-backed supply (no longer bridged from Ethereum), so TVL is the sum of the supply on every chain.',
    ethereum: {
        tvl: ethereumTvl,
    },
    base: {
        tvl: baseTvl,
    },
    solana: {
        tvl: solanaTvl,
    },
};
