/**
 * GroypFi — TVL adapter (DefiLlama/DefiLlama-Adapters -> projects/groypfi/index.js)
 *
 * TVL = protocol-owned liquidity on DeDust.io (CPMM v2 pools).
 *
 * DeDust CPMM v2 does NOT use LP jettons: each liquidity provider owns a
 * per-pool `Position` contract, derived from the pool via
 * `get_position_address(owner)`. This adapter:
 *   1. Discovers the pools each GroypFi wallet has provided liquidity to by
 *      scanning its outgoing messages for CPMM v2 opcodes
 *      (PayNative 0xa5a7cbf8, PayJetton 0xcbc33949, Withdraw 0x20b5ef89,
 *       ClaimPositionFees 0x5652f1df).
 *   2. Resolves the wallet's Position contract for each pool and reads its
 *      `liquidity` via `get_position_data`.
 *   3. Reads the pool's `reserve_x` / `reserve_y` / `liquidity` via
 *      `get_pool_data` and credits the wallet's pro-rata share of both sides.
 *
 * Owner wallets:
 *   UQClgkR0eLgWAR0tZh8YbQyDqa-Jn5wUP1XHPLDB6RmAPySF
 *   UQDu4AiT__JKuqT0Znje0RoXIQMPcj4uIGYZme3UK4hFlE_Q
 *
 * Website: https://groypfi.io
 * Contact: zeuraph7@gmail.com
 */

const { get } = require("../helper/http");

const TON_API = "https://tonapi.io/v2";
const TON_CG_ID = "coingecko:the-open-network";

// GroypFi liquidity-owning wallets (raw form)
const OWNERS = [
  // UQClgkR0eLgWAR0tZh8YbQyDqa-Jn5wUP1XHPLDB6RmAPySF
  "0:a582447478b816011d2d661f186d0c83a9af899f9c143f55c73cb0c1e919803f",
  // UQDu4AiT__JKuqT0Znje0RoXIQMPcj4uIGYZme3UK4hFlE_Q
  "0:eee00893fff24abaa4f46678ded11a1721030f723e2e20661999edd42b884594",
];

// DeDust CPMM v2 opcodes sent by a liquidity provider to a Pool contract
const CPMM_V2_OPS = /(a5a7cbf8|cbc33949|20b5ef89|5652f1df)/i;

const TX_PAGES = 5;
const TX_LIMIT = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function safeGet(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      return await get(url);
    } catch (e) {
      if (i === tries - 1) return null;
      await sleep(800 * (i + 1));
    }
  }
  return null;
}

// Discover CPMM v2 pools this wallet has interacted with as an LP
async function discoverPools(owner) {
  const pools = new Set();
  let beforeLt;

  for (let page = 0; page < TX_PAGES; page++) {
    let url = `${TON_API}/blockchain/accounts/${owner}/transactions?limit=${TX_LIMIT}&sort_order=desc`;
    if (beforeLt) url += `&before_lt=${beforeLt}`;

    const res = await safeGet(url);
    const txs = (res && res.transactions) || [];
    if (!txs.length) break;

    for (const tx of txs) {
      for (const msg of tx.out_msgs || []) {
        const dest = msg.destination && msg.destination.address;
        if (!dest) continue;
        if (CPMM_V2_OPS.test(String(msg.op_code || ""))) pools.add(dest);
      }
    }

    beforeLt = txs[txs.length - 1].lt;
    await sleep(150);
  }

  return [...pools];
}

async function tvl(api) {
  for (const owner of OWNERS) {
    const pools = await discoverPools(owner);

    for (const pool of pools) {
      const posRes = await safeGet(
        `${TON_API}/blockchain/accounts/${pool}/methods/get_position_address?args=${owner}`,
      );
      const posAddr =
        posRes && posRes.decoded && posRes.decoded.position_address;
      if (!posAddr) continue;

      const posData = await safeGet(
        `${TON_API}/blockchain/accounts/${posAddr}/methods/get_position_data`,
      );
      if (!posData || !posData.success) continue;

      // stack: poolAddress, ownerAddress, liquidity, lockedLiquidity, ...
      const liqRaw = posData.stack && posData.stack[2] && posData.stack[2].num;
      if (!liqRaw) continue;
      const liquidity = BigInt(liqRaw);
      if (liquidity <= 0n) continue;

      const poolData = await safeGet(
        `${TON_API}/blockchain/accounts/${pool}/methods/get_pool_data`,
      );
      const d = poolData && poolData.decoded;
      if (!d) continue;

      const total = BigInt(d.liquidity || "0");
      if (total <= 0n) continue;

      // asset_x is native TON (empty address), asset_y is a jetton master
      const reserveX = BigInt(d.reserve_x || "0");
      const reserveY = BigInt(d.reserve_y || "0");

      if (reserveX > 0n) {
        api.add(TON_CG_ID, ((reserveX * liquidity) / total).toString());
      }
      if (reserveY > 0n && d.asset_y) {
        api.add(`ton:${d.asset_y}`, ((reserveY * liquidity) / total).toString());
      }

      await sleep(120);
    }
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "TVL counts GroypFi's protocol-owned liquidity on DeDust.io CPMM v2 pools. For every pool the protocol wallets provide liquidity to, their Position contract liquidity is read on-chain and converted into a pro-rata share of the pool's reserves, priced in USD.",
  ton: { tvl },
};
