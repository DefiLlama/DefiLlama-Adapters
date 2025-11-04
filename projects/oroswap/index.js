const { queryContract } = require('../helper/chain/cosmos');
const { transformBalances } = require('../helper/portedTokens');

const FACTORY_CONTRACT = 'zig1xx3aupmgv3ce537c0yce8zzd3sz567syaltr2tdehu3y803yz6gsc6tz85';
const API_CALL_DELAY = 10; // Rate limit throttling for public REST API
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Initial retry delay in ms

const STZIG_DENOM = 'coin.zig109f7g2rzl2aqee7z6gffn8kfe9cpqx0mjkk7ethmx8m2hq4xpe9snmaam2.stzig';

// Valdora Staker contract address (https://docs.valdora.finance/smart-contracts)
const VALDORA_STAKER_CONTRACT = 'zig18nnde5tpn76xj3wm53n0tmuf3q06nruj3p6kdemcllzxqwzkpqzqk7ue55';

/**
 * Fetches the conversion rate from stZIG to uZIG using the redeem-side quote from the Valdora Staker contract
 * 
 * How it works:
 * 1. Query the contract with reverse_st_zig_price: "If I redeem X uZIG worth of stZIG, how much stZIG do I get?"
 * 2. The contract responds with stzig_amount (amount of stZIG received for probe_uzig uZIG)
 * 3. We invert this: uzig_per_stzig = probe_uzig / stzig_amount
 * 
 * We use a large probe amount (1,000 ZIG) for precision:
 * - Larger probe = more precision in integer division
 * - Reduces rounding errors when calculating the ratio
 * - Result is scaled by 1e6 to maintain precision (returns ratio * 1,000,000)
 * 
 * Returns the ratio of uZIG per 1 stZIG, scaled by 1e6 (or null if query fails)
 * Example: if 1 stZIG = 0.989 ZIG, returns ~989,000
 */
async function fetchUzigPerStzig() {
  // Use 1,000 ZIG (1 billion uZIG) as probe for better precision in integer math
  // This is the amount of uZIG we're "simulating" a redeem with
  const probeUzig = 1_000_000_000; // 1,000 ZIG in uZIG (base units with 6 decimals)
  
  // Query: "If I redeem this much uZIG, how much stZIG do I get?"
  // The contract uses reverse pricing logic (redeem path)
  const { stzig_amount } = await queryContract({
    contract: VALDORA_STAKER_CONTRACT,
    chain: 'zigchain',
    data: { reverse_st_zig_price: { amount: String(probeUzig) } },
  });

  if (!stzig_amount || stzig_amount === '0') return null;
  
  // Calculate: uzig_per_stzig = probe_uzig / stzig_amount
  // We scale by 1e6 to maintain precision: (probe * 1e6) / stzig_amount
  // This gives us the ratio scaled by 1,000,000
  // Example: if probe=1e9 and stzig_amount=989580475, then ratio_scaled = ~1,010,528
  return (BigInt(probeUzig) * 1_000_000n) / BigInt(stzig_amount);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, maxAttempts = MAX_RETRIES) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }
            const delay = RETRY_DELAY * attempt; // Exponential backoff
            console.error(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
            await sleep(delay);
        }
    }
}

async function getAllPairs() {
    const allPairs = [];
    let startAfter = undefined;
    const limit = 30;

    while (true) {
        const query = { pairs: { limit } };
        if (startAfter) {
            query.pairs.start_after = startAfter;
        }

        try {
            const response = await withRetry(() => queryContract({
                contract: FACTORY_CONTRACT,
                chain: 'zigchain',
                data: query
            }));

            if (!response.pairs || response.pairs.length === 0) {
                break;
            }

            allPairs.push(...response.pairs);

            const lastPair = response.pairs[response.pairs.length - 1];
            const nextCursor = { asset_infos: lastPair.asset_infos, pair_type: lastPair.pair_type };
            if (response.pairs.length < limit) {
                break;
            }
            if (startAfter && JSON.stringify(startAfter) === JSON.stringify(nextCursor)) {
                break;
            }
            startAfter = nextCursor;
            await sleep(API_CALL_DELAY);
        } catch (error) {
            console.error('Failed to fetch pairs from factory:', error);
            throw error;
        }
    }

    return allPairs;
}

async function getPoolInfo(contractAddr) {
    return await withRetry(() => queryContract({
        contract: contractAddr,
        chain: 'zigchain',
        data: { pool: {} }
    }));
}

function getAssetKey(assetInfo) {
    if (assetInfo.native_token) {
        return assetInfo.native_token.denom;
    } else if (assetInfo.token) {
        return assetInfo.token.contract_addr;
    }
    return null;
}

async function tvl(api) {
    try {
        const pairs = await getAllPairs();

        for (const pair of pairs) {
            const poolInfo = await getPoolInfo(pair.contract_addr);
            if (!poolInfo || !poolInfo.assets) {
                continue;
            }

            for (const asset of poolInfo.assets) {
                const assetKey = getAssetKey(asset.info);
                if (assetKey && asset.amount) {
                    api.add(assetKey, asset.amount);
                }
            }

            await sleep(API_CALL_DELAY);
        }
        const balances = api.getBalances();
        
        // Convert stZIG balances to uZIG equivalent for TVL calculation
        const stzigKeyRaw = STZIG_DENOM;
        const stzigKeyPrefixed = `zigchain:${STZIG_DENOM}`;
        const stzigBalStr = balances[stzigKeyPrefixed] || balances[stzigKeyRaw];
        
        if (stzigBalStr) {
            // Fetch the current conversion rate from on-chain quote (redeem path)
            const ratioScaled = await fetchUzigPerStzig();
            
            if (ratioScaled) {
                // Convert stZIG balance to uZIG equivalent
                // Formula: uzig_equivalent = (stzig_balance * ratio_scaled) / 1_000_000
                // We divide by 1_000_000 to remove the scaling we added in fetchUzigPerStzig
                const stzigBal = BigInt(stzigBalStr);
                const uzigEq = (stzigBal * ratioScaled) / 1_000_000n;
                
                // Remove stZIG from balances (we've converted it to uZIG)
                delete balances[stzigKeyPrefixed];
                delete balances[stzigKeyRaw];
                
                // Add the uZIG equivalent to the existing uZIG balance
                const uzigKey = 'zigchain:uzig';
                const currentUzig = balances[uzigKey] ? BigInt(balances[uzigKey]) : 0n;
                balances[uzigKey] = (currentUzig + uzigEq).toString();
            }
        }
        return transformBalances('zigchain', balances);
    } catch (error) {
        console.error('Error calculating TVL:', error);
        throw error;
    }
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: 'TVL is calculated by summing all assets locked in OroSwap liquidity pools on ZIGChain',
    zigchain: { tvl }
};