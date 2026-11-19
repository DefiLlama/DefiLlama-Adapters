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
 * Fetches the conversion rate from stZIG to aZIG using the redeem-side quote from the Valdora Staker contract
 * 
 * How it works:
 * 1. Query the contract with reverse_st_zig_price: "If I redeem X aZIG worth of stZIG, how much stZIG do I get?"
 * 2. The contract responds with stzig_amount (amount of stZIG received for probe_azig aZIG)
 * 3. We invert this: azig_per_stzig = probe_azig / stzig_amount
 * 
 * We use a large probe amount (1,000 ZIG) for precision:
 * - Larger probe = more precision in integer division
 * - Reduces rounding errors when calculating the ratio
 * - Result is scaled by 1e6 (stZIG has 6 decimals), so it is aZIG per 1 whole stZIG
 * 
 * Returns the ratio of aZIG per 1 stZIG, scaled by 1e6 (or null if query fails)
 * Example: if 1 stZIG = 1.07 ZIG, returns ~1,070,000,000,000,000,000
 */
async function fetchAzigPerStzig() {
  // Use 1,000 ZIG as probe for better precision in integer math
  // This is the amount of aZIG we're "simulating" a redeem with
  // After ZIGChain's v5 upgrade, uzig is changed to azig and decimals changed from 6 to 18
  const probeAzig = 1_000_000_000_000_000_000_000n; // 1,000 ZIG in aZIG (base units with 18 decimals)
  
  // Query: "If I redeem this much aZIG, how much stZIG do I get?"
  // The contract uses reverse pricing logic (redeem path)
  const { stzig_amount } = await queryContract({
    contract: VALDORA_STAKER_CONTRACT,
    chain: 'zigchain',
    data: { reverse_st_zig_price: { amount: String(probeAzig) } },
  });

  if (!stzig_amount || stzig_amount === '0') return null;
  
  // Calculate: azig_per_stzig = probe_azig / stzig_amount
  // We scale by 1e6 to maintain precision: (probe * 1e6) / stzig_amount
  // This gives us the ratio scaled by 1,000,000
  // Example: if probe=1e21 and stzig_amount=932580520, then ratio_scaled = ~1,072,293,000,000,000,000
  return (probeAzig * 1_000_000n) / BigInt(stzig_amount);
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
            // After ZIGChain's v5 upgrade, uzig is changed to azig. Pools not yet migrated still
            // return uzig, which makes the factory skip pairs, so the cursor must use azig
            const assetInfos = lastPair.asset_infos.map(info =>
                info.native_token && info.native_token.denom === 'uzig' ? { native_token: { denom: 'azig' } } : info
            );
            const nextCursor = { asset_infos: assetInfos, pair_type: lastPair.pair_type };
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
        
        // Convert stZIG balances to aZIG equivalent for TVL calculation
        const stzigKeyRaw = STZIG_DENOM;
        const stzigKeyPrefixed = `zigchain:${STZIG_DENOM}`;
        const stzigBalStr = balances[stzigKeyPrefixed] || balances[stzigKeyRaw];
        
        if (stzigBalStr) {
            // Fetch the current conversion rate from on-chain quote (redeem path)
            const ratioScaled = await fetchAzigPerStzig();
            
            if (ratioScaled) {
                // Convert stZIG balance to aZIG equivalent
                // Formula: azig_equivalent = (stzig_balance * ratio_scaled) / 1_000_000
                // We divide by 1_000_000 to remove the scaling we added in fetchAzigPerStzig
                const stzigBal = BigInt(stzigBalStr);
                const azigEq = (stzigBal * ratioScaled) / 1_000_000n;
                
                // Remove stZIG from balances (we've converted it to aZIG)
                delete balances[stzigKeyPrefixed];
                delete balances[stzigKeyRaw];
                
                // Add the aZIG equivalent to the existing aZIG balance
                const azigKey = 'zigchain:azig';
                const currentAzig = balances[azigKey] ? BigInt(balances[azigKey]) : 0n;
                balances[azigKey] = (currentAzig + azigEq).toString();
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