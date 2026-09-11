const { get, post } = require('../helper/http');

const NAMADA_INDEXER = 'https://indexer.namada.net';
const NAMADA_RPC = 'https://rpc.namada.net';

const MASP_ADDRESS = "tnam1pcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzmefah";
const MULTITOKEN_ADDRESS = "tnam1pyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqej6juv";
const NAM_ADDRESS = 'tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7';
const U64_BASE = 2n ** 64n;

function decodeAmount(value) {
    const buffer = Buffer.from(value, 'base64');
    if (buffer.length !== 32) throw new Error(`Unexpected Namada amount length: ${buffer.length}`);

    let amount = 0n;
    for (let i = 3; i >= 0; i--) {
        amount = amount * U64_BASE + buffer.readBigUInt64LE(i * 8);
    }
    return amount;
}

async function getMaspBalance(tokenAddress) {
    const { result } = await post(NAMADA_RPC, {
        jsonrpc: "2.0",
        id: '1',
        method: "abci_query",
        params: {
            path: `/shell/value/#${MULTITOKEN_ADDRESS}/#${tokenAddress}/balance/#${MASP_ADDRESS}`,
            data: "",
            prove: false,
        },
    });

    const value = result?.response?.value;
    return value ? decodeAmount(value) : 0n;
}

async function tvl(api) {
    const balances = await get(`${NAMADA_INDEXER}/api/v1/account/${MASP_ADDRESS}`);
    if (!Array.isArray(balances)) throw new Error('Missing Namada MASP balances');

    for (const { token, minDenomAmount } of balances) {
        const tokenAddress = token?.address;
        if (!tokenAddress || tokenAddress === NAM_ADDRESS || minDenomAmount === '0') continue;

        const amount = await getMaspBalance(tokenAddress);
        if (amount > 0n) api.add(tokenAddress, amount.toString());
    }
}

module.exports = {
    methodology: 'Calculates TVL by querying Namada RPC for non-native MASP token balances discovered from the official Namada indexer.',
    timetravel: false,
    hallmarks: [
        ['2025-02-24', 'Namada Phase 3 (IBC + MASP) launched'],
    ],
    namada: {
        tvl,
    }
};
