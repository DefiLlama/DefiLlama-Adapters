const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");
const axios = require("axios");

const SCALE = BigInt("1000000000000000000"); // 1e18

// ARC-4 MarketData tuple byte offsets (329 bytes total):
// Field 10 – totalScaledBorrows (uint256) starts at byte 145
// Field 12 – borrowIndex        (uint256) starts at byte 209
const BORROWS_OFFSET = 145;
const BORROW_IDX_OFFSET = 209;

// Chain indexer URLs (same response format for both chains)
const INDEXER_URL = {
  algorand: "https://mainnet-idx.algonode.cloud",
  voi: "https://mainnet-idx.voi.nodely.dev",
};

// Pool app IDs per chain
const POOL_IDS = {
  algorand: [3207735602, 3212536201],
  voi: [41760711, 44866061],
};

function readUint256(buf, offset) {
  let v = 0n;
  for (let i = 0; i < 32; i++) v = (v << 8n) | BigInt(buf[offset + i]);
  return v;
}

/** Generic indexer helper */
async function indexerGet(chain, path, params) {
  const { data } = await axios.get(`${INDEXER_URL[chain]}${path}`, { params });
  return data;
}

async function lookupAccount(chain, address) {
  const data = await indexerGet(chain, `/v2/accounts/${address}`);
  return data.account;
}

async function getAppGlobalState(chain, appId) {
  const data = await indexerGet(chain, `/v2/applications/${appId}`);
  const results = {};
  for (const x of data.application.params["global-state"]) {
    const key = Buffer.from(x.key, "base64").toString("binary");
    results[key] = x.value.uint;
    if (x.value.type === 1)
      results[key] = Buffer.from(x.value.bytes, "base64").toString("binary");
  }
  return results;
}

/** Read a market's ABI-encoded box from the pool contract via indexer. */
async function readMarketBox(chain, poolAppId, marketAppId) {
  const prefix = Buffer.from("markets");
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64BE(BigInt(marketAppId));
  const boxKey = Buffer.concat([prefix, idBuf]).toString("base64");
  const data = await indexerGet(chain, `/v2/applications/${poolAppId}/box`, {
    name: `b64:${boxKey}`,
  });
  return Buffer.from(data.value, "base64");
}

/**
 * Discover all market apps for a single pool via its created sToken apps.
 * Each sToken has a `token_id` pointing to the underlying market contract.
 */
async function discoverPoolMarkets(chain, poolId) {
  const poolAddress = getApplicationAddress(poolId);
  const account = await lookupAccount(chain, poolAddress);
  const createdApps = account["created-apps"] || [];
  const tokenAppIds = new Set();

  const states = await Promise.all(
    createdApps.map((a) => getAppGlobalState(chain, a.id))
  );
  for (const state of states) {
    if (state.token_id) tokenAppIds.add(state.token_id);
  }
  return tokenAppIds;
}

/** Discover all markets across all pools for a chain.  Returns Map<marketAppId, poolAppId>. */
async function discoverAllMarkets(chain) {
  const markets = new Map();
  for (const poolId of POOL_IDS[chain]) {
    const marketIds = await discoverPoolMarkets(chain, poolId);
    for (const mid of marketIds) markets.set(mid, poolId);
  }
  return markets;
}

/** Factory: create chain-specific TVL function */
function makeTvl(chain) {
  return async function tvl(api) {
    const markets = await discoverAllMarkets(chain);
    const addresses = [...markets.keys()].map((id) => getApplicationAddress(id));
    const accounts = await Promise.all(
      addresses.map((addr) => lookupAccount(chain, addr))
    );
    for (const account of accounts) {
      const netNative = Math.max(
        0,
        account.amount - (account["min-balance"] || 0)
      );
      if (netNative > 0) api.add("1", netNative);
      for (const asset of account.assets || []) {
        if (asset.amount > 0)
          api.add(String(asset["asset-id"]), asset.amount);
      }
    }
  };
}

/**
 * Factory: create chain-specific borrowed function.
 *
 * Each market has a 329-byte ABI-encoded box in its pool contract keyed by
 * "markets" + uint64BE(marketAppId).  The MarketData tuple stores:
 *   totalScaledBorrows (uint256) at byte 145
 *   borrowIndex        (uint256) at byte 209
 *
 * Actual borrows = totalScaledBorrows × borrowIndex / 1e18
 */
function makeBorrowed(chain) {
  return async function borrowed(api) {
    const markets = await discoverAllMarkets(chain);

    for (const [marketAppId, poolAppId] of markets) {
      // Only the box fetch may legitimately 404 (market not yet initialised).
      // Keep all other logic outside the catch so errors from decoding or
      // lookupAccount propagate instead of being silently swallowed.
      let boxData;
      try {
        boxData = await readMarketBox(chain, poolAppId, marketAppId);
      } catch (e) {
        const status = e?.response?.status ?? e?.status;
        if (status === 404) continue;
        throw e;
      }

      const scaledBorrows = readUint256(boxData, BORROWS_OFFSET);
      if (scaledBorrows === 0n) continue;

      const borrowIndex = readUint256(boxData, BORROW_IDX_OFFSET);
      const actualBorrows = (scaledBorrows * borrowIndex) / SCALE;
      if (actualBorrows === 0n) continue;

      // Identify underlying token from the market contract's account
      const addr = getApplicationAddress(marketAppId);
      const account = await lookupAccount(chain, addr);
      const positiveAsset = (account.assets || []).find(
        (a) => a.amount > 0
      );
      if (positiveAsset) {
        api.add(
          String(positiveAsset["asset-id"]),
          actualBorrows.toString()
        );
      } else {
        // Native token market (ALGO / VOI)
        api.add("1", actualBorrows.toString());
      }
    }
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL counts all native tokens and ASAs deposited into DorkFi lending pools " +
    "on Algorand and Voi. Borrowed amounts are read from pool contract market " +
    "boxes (ABI-encoded MarketData).",
  algorand: {
    tvl: makeTvl("algorand"),
    borrowed: makeBorrowed("algorand"),
  },
  voi: {
    tvl: makeTvl("voi"),
    borrowed: makeBorrowed("voi"),
  },
};
