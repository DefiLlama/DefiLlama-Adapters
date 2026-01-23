// Place under MetaDAO parent project as Futarchy AMM and combine with existing Futarchy AMM volume, fees, and revenue.
const { getConnection, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const PROGRAM_ID = 'FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq' // Futarchy AMM program
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' // Defined to verify token accounts

// Hardcoded offsets
const DAO_ACCOUNT_SIZE = 1163;
const BASE_VAULT_OFFSET = 221;
const QUOTE_VAULT_OFFSET = 253;

// Check if account is a valid SPL token account
function isValidTokenAccount(info) {
    if (!info || !info.data) return false;
    return info.data.length === 165 && info.owner?.toString() === TOKEN_PROGRAM_ID;
}

// Fetch accounts
async function getMultipleAccountsInfoChunked(connection, pubkeys, chunkSize = 100) {
    const results = [];
    for (let i = 0; i < pubkeys.length; i += chunkSize) {
        const slice = pubkeys.slice(i, i + chunkSize);
        const infos = await connection.getMultipleAccountsInfo(slice);
        results.push(...infos);
    }
    return results;
}

// Scan raw DAO account data to find embedded SPL token accounts as fallback
async function scanVaultsFallback(connection, data) {
    const candidatePubkeys = [];

    for (let i = 0; i <= data.length - 32; i++) {
        try {
            const pk = new PublicKey(data.slice(i, i + 32));
            candidatePubkeys.push(pk.toString());
        } catch {
        }
    }

    const uniqueCandidates = [...new Set(candidatePubkeys)];
    if (!uniqueCandidates.length) return [];

    const pubkeyObjs = uniqueCandidates.map((a) => new PublicKey(a));
    const infos = await getMultipleAccountsInfoChunked(connection, pubkeyObjs);

    const vaults = [];
    for (let i = 0; i < uniqueCandidates.length; i++) {
        const info = infos[i];
        if (isValidTokenAccount(info)) {
            vaults.push(uniqueCandidates[i]);
        }
    }

    return [...new Set(vaults)].slice(0, 2);
}

// Get TVL. Discovers all DAO vaults and sums their balances.
async function tvl() {
    const connection = getConnection();

    const daoAccounts = await connection.getProgramAccounts(
        new PublicKey(PROGRAM_ID),
        { filters: [{ dataSize: DAO_ACCOUNT_SIZE }] }
    );

    console.log("DAO accounts found:", daoAccounts.length);

    const daoVaultCandidates = []; // { dao, base, quote, data }
    for (const { pubkey, account } of daoAccounts) {
        const daoPub = pubkey.toString();
        const data = account.data;
        let base = null;
        let quote = null;

        try {
            base = new PublicKey(
                data.slice(BASE_VAULT_OFFSET, BASE_VAULT_OFFSET + 32)
            ).toString();

            quote = new PublicKey(
                data.slice(QUOTE_VAULT_OFFSET, QUOTE_VAULT_OFFSET + 32)
            ).toString();

            console.log(`DAO ${daoPub}:`);
            console.log(`  Base vault:  ${base}`);
            console.log(`  Quote vault: ${quote}`);
        } catch (e) {
            console.log(`Error parsing DAO ${daoPub} with hardcoded offsets:`, e.message);
        }

        daoVaultCandidates.push({ dao: daoPub, base, quote, data });
    }

    const initialVaultAddrs = [
        ...new Set(
            daoVaultCandidates.flatMap(({ base, quote }) => [base, quote]).filter(Boolean)
        ),
    ];

    console.log("Initial candidate vault accounts from offsets:", initialVaultAddrs.length);

    const initialPubkeys = initialVaultAddrs.map((a) => new PublicKey(a));
    const initialInfos = await getMultipleAccountsInfoChunked(connection, initialPubkeys);

    const infoMap = {};
    for (let i = 0; i < initialVaultAddrs.length; i++) {
        infoMap[initialVaultAddrs[i]] = initialInfos[i];
    }

    const finalVaults = [];

    for (const { dao, base, quote, data } of daoVaultCandidates) {
        let chosenBase = null;
        let chosenQuote = null;

        const baseInfo = base ? infoMap[base] : null;
        const quoteInfo = quote ? infoMap[quote] : null;

        if (isValidTokenAccount(baseInfo) && isValidTokenAccount(quoteInfo)) {
            chosenBase = base;
            chosenQuote = quote;
            console.log(`DAO ${dao}: using offset-derived vaults.`);
        } else {
            console.log(`DAO ${dao}: offset vaults invalid, falling back to buffer scan.`);
            const fallbackVaults = await scanVaultsFallback(connection, data);

            if (fallbackVaults.length >= 2) {
                chosenBase = fallbackVaults[0];
                chosenQuote = fallbackVaults[1];
                console.log(`DAO ${dao}:`);
                console.log(`  Fallback Base vault:  ${chosenBase}`);
                console.log(`  Fallback Quote vault: ${chosenQuote}`);
            } else {
                console.log(`DAO ${dao}: ERROR - could not reliably detect 2 vaults, skipping.`);
            }
        }

        if (chosenBase && chosenQuote) {
            finalVaults.push(chosenBase, chosenQuote);
        }
    }

    console.log("Final vault accounts (before dedupe):", finalVaults.length);

    const uniqueVaults = [...new Set(finalVaults)];
    console.log("Unique vault accounts:", uniqueVaults.length);

    if (!uniqueVaults.length) {
        console.log("No valid vault accounts found.");
        return {};
    }

    const uniquePubkeys = uniqueVaults.map((a) => new PublicKey(a));
    const accountInfos = await getMultipleAccountsInfoChunked(connection, uniquePubkeys);

    const validVaults = uniqueVaults.filter((addr, i) =>
        isValidTokenAccount(accountInfos[i])
    );

    const skipped = uniqueVaults.length - validVaults.length;
    console.log(`Valid token vaults: ${validVaults.length}, Skipped after final filter: ${skipped}`);

    if (!validVaults.length) return {};

    return sumTokens2({
        tokenAccounts: validVaults,
    });
}

const methodology = {
    TVL:
        "Calculated as the dollarized sum of all SPL token balances held by Futarchy AMM Base and Quote Vaults."
};

module.exports = {
    timetravel: false,
    solana: {
        tvl,
        methodology,
    },
};