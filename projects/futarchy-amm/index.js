// Place under MetaDAO parent project as Futarchy AMM and combine with existing Futarchy AMM volume, fees, and revenue.
const { getConnection, sumTokens2, TOKEN_PROGRAM_ID } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const PROGRAM_ID = 'FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq' // Futarchy AMM program

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
        const pk = new PublicKey(data.slice(i, i + 32));
        candidatePubkeys.push(pk.toString());
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

    const daoVaultCandidates = []; // { dao, base, quote, data }
    for (const { pubkey, account } of daoAccounts) {
        const daoPub = pubkey.toString();
        const data = account.data;
        let base = null;
        let quote = null;

        base = new PublicKey(
            data.slice(BASE_VAULT_OFFSET, BASE_VAULT_OFFSET + 32)
        ).toString();

        quote = new PublicKey(
            data.slice(QUOTE_VAULT_OFFSET, QUOTE_VAULT_OFFSET + 32)
        ).toString();

        daoVaultCandidates.push({ dao: daoPub, base, quote, data });
    }

    const initialVaultAddrs = [
        ...new Set(
            daoVaultCandidates.flatMap(({ base, quote }) => [base, quote]).filter(Boolean)
        ),
    ];

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
        } else {
            const fallbackVaults = await scanVaultsFallback(connection, data);

            if (fallbackVaults.length >= 2) {
                chosenBase = fallbackVaults[0];
                chosenQuote = fallbackVaults[1];
            }
        }

        if (chosenBase && chosenQuote) {
            finalVaults.push(chosenBase, chosenQuote);
        }
    }

    const uniqueVaults = [...new Set(finalVaults)];

    if (!uniqueVaults.length) return {};

    const uniquePubkeys = uniqueVaults.map((a) => new PublicKey(a));
    const accountInfos = await getMultipleAccountsInfoChunked(connection, uniquePubkeys);

    const validVaults = uniqueVaults.filter((_, i) =>
        isValidTokenAccount(accountInfos[i])
    );

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