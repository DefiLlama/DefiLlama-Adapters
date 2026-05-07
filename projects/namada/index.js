const { fetchURL } = require('../helper/utils');
const BigNumber = require("bignumber.js");

// Define the Borsh schema for deserializing the balance response
// This should match the Amount struct in Namada which has 4 u64 limbs
class Amount {
    constructor({ amount }) {
        this.amount = amount;
    }
}

const schema = new Map([
    [Amount, { kind: 'struct', fields: [['amount', [4]]] }],
]);

const u64Base = new BigNumber(2).pow(64);

// Indexer provider
const NAMADA_INDEXER = 'https://indexer.namada.tududes.com';
/// RPC provider
const NAMADA_RPC = 'https://rpc.namada.tududes.com:443';

const MASP_ADDRESS = "tnam1pcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzmefah";
const MULTITOKEN_ADDRESS = "tnam1pyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqej6juv";

async function tvl(api) {
    // Get all tokens on Namada by querying the IBC rate limits endpoint
    let rate_limits = await fetchURL(`${NAMADA_INDEXER}/api/v1/ibc/rate-limits`);

    // Query MASP balance for each non-native token via RPC
    for (const [idx, data] of Object.entries(rate_limits.data)) {
        // Exclude native token NAM
        if (data.tokenAddress == 'tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7') {
            continue;
        }


        // console.log(`Fetching MASP balance for token: ${data.tokenAddress}`);

        // Prepare RPC request
        const requestBody = {
            jsonrpc: "2.0",
            id: '1',
            method: "abci_query",
            params: {
                path: `/shell/value/#${MULTITOKEN_ADDRESS}/#${data.tokenAddress}/balance/#${MASP_ADDRESS}`,
                data: "",
                prove: false,
            },
        };

        // console.log(`Making RPC request: ${JSON.stringify(requestBody, null, 2)}`);

        // Use native fetch for RPC call since fetchURL doesn't work well with POST
        const response = await fetch(NAMADA_RPC, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error(`RPC request failed with status: ${response.status}`);
            const text = await response.text();
            console.error(`Response text: ${text}`);
            continue;
        }

        const json = await response.json();
        // console.log(`RPC response: ${JSON.stringify(json, null, 2)}`);

        if (!json.result || !json.result.response) {
            console.log(`No result.response in RPC response for token ${data.tokenAddress}`);
            continue;
        }

        if (!json.result.response.value) {
            console.log(`No MASP balance found for token ${data.tokenAddress} (empty value)`);
            continue;
        }

        const value_base64 = json.result.response.value;
        // console.log(`Base64 value: ${value_base64}`);

        // Decode base64 value
        const value = Buffer.from(value_base64, 'base64');
        // console.log(`Decoded buffer: ${Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);


        // Try to deserialize as raw u64 array first
        if (value.length === 32) { // 4 u64s = 32 bytes
            const limbs = [];
            for (let i = 0; i < 4; i++) {
                const limb = value.readBigUInt64LE(i * 8);
                limbs.push(limb.toString());
            }

            // console.log("Decoded limbs:", limbs);

            // Convert from u64 limbs to BigNumber
            const result = limbs.reduceRight((acc, limb) => {
                return acc.multipliedBy(u64Base).plus(BigNumber(limb));
            }, BigNumber(0));

            // console.log(`MASP balance for ${data.tokenAddress}: ${result.toFixed()}`);

            if (result.gt(0)) {
                api.add(data.tokenAddress, result.toFixed());
            }
        } else {
            console.log(`Unexpected value length: ${value.length}, expected 32 bytes`);
        }
    }
}

module.exports = {
    methodology: 'Calculates TVL by querying an RPC for the MASP balance of each whitelisted token within Namada',
    timetravel: false,
    hallmarks: [
        ['2025-02-24', 'Namada Phase 3 (IBC + MASP) launched'],
    ],
    namada: {
        tvl,
    }
};