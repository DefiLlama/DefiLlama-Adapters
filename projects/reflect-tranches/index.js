const { getProvider } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

// Reflect Tranches (https://reflect.money) — two-tranche protection built on two Solana programs:
//   - SENIOR = Reflect Proxy Program (branded yield-bearing stablecoin wrappers). The senior
//     tranche is a proxy Vault whose underlying is backstopped by an RLP pool.
//   - JUNIOR = RLP (Reflect Liquid Protection) — a multi-asset insurance pool; LP token = junior token.
// TVL is read entirely from on-chain account data and deserialized manually (no anchor coder, no deps).
// The underlyings are Reflect's own yield-bearing stablecoins (not DefiLlama-priced), so each holding
// is valued via its on-chain oracle (Pyth PriceUpdateV2 or Doppler) and injected as a USD value.
// Those same dollars are also counted by the underlying Reflect protocols, so this is doublecounted.
const RLP_PROGRAM = new PublicKey("JrXLmS6aYJNJDVxdAfjNJE5wikT8ubf3TA9iL2JA9Av");
const PROXY_PROGRAM = new PublicKey("pRoxYU64BSjv8HbhENna8a7LVCrkzzNrnvbYuTwas8C");

const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ATA_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

// Oracle owner programs (from reflect-proxy-program/src/constants.rs).
const DOPPLER_ORACLE = new PublicKey("PRicevBH6BaeaE8qmrxrwGBZ5hSZ9vjBNue5Ygot1ML");
const PYTH_ORACLE = new PublicKey("rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ");

// RLP Anchor 8-byte discriminators.
const RLP_ASSET_DISC = Buffer.from([234, 180, 241, 252, 139, 224, 160, 8]);
const RLP_POOL_DISC = Buffer.from([66, 38, 17, 64, 188, 80, 68, 129]);

// Only these RLP pool indices (LiquidityPool.index @ offset 9) are live Reflect Tranches pairs.
// Other pools on the program are empty test/placeholder pools (some with dangling protected_vault
// references) and must not be counted. Extend this set when new tranche pools go live.
const TRANCHE_POOL_INDICES = new Set([4]);
// Proxy program is Pinocchio (no discriminator) — accounts identified by exact data size.
const PROXY_STATE_SIZE = 156;
const PROXY_ASSET_SIZE = 98;

const ataFor = (mint, owner) =>
  PublicKey.findProgramAddressSync([owner.toBuffer(), TOKEN_PROGRAM.toBuffer(), mint.toBuffer()], ATA_PROGRAM)[0];

// Return USD-per-whole-token from a fetched oracle account, dispatching by owner program.
// Doppler (17 bytes): slot(u64) price(u64) precision(u8) -> price * 10^-precision.
// Pyth PriceUpdateV2: disc(8) write_authority(32) VerificationLevel(1 Full | 2 Partial)
//   then PriceFeedMessage { feed_id(32) price(i64) conf(u64) exponent(i32) ... } -> price * 10^exponent.
function parseOraclePrice(info) {
  if (!info) return null;
  const d = info.data;
  if (info.owner.equals(DOPPLER_ORACLE)) {
    if (d.length < 17) return null;
    const price = Number(d.readBigUInt64LE(8));
    const precision = d[16];
    return price / 10 ** precision;
  }
  if (info.owner.equals(PYTH_ORACLE)) {
    const base = 8 + 32; // after discriminator + write_authority
    const vl = d[base];
    const pfm = base + (vl === 1 ? 1 : 2); // Full = 1 byte, Partial = 2 bytes
    const price = Number(d.readBigInt64LE(pfm + 32));
    const exponent = d.readInt32LE(pfm + 48);
    return price * 10 ** exponent;
  }
  return null;
}

async function getMultipleAccounts(connection, pubkeys) {
  const out = [];
  for (let i = 0; i < pubkeys.length; i += 100) {
    out.push(...(await connection.getMultipleAccountsInfo(pubkeys.slice(i, i + 100))));
  }
  return out;
}

async function tvl(api) {
  const connection = getProvider().connection;

  // --- Build mint -> oracle account map from both programs' Asset registries ---
  const mintToOracle = {}; // mintBase58 -> oracle account PublicKey
  const rlpAssetByIndex = {}; // index -> mintBase58

  const proxyAssets = await connection.getProgramAccounts(PROXY_PROGRAM, {
    filters: [{ dataSize: PROXY_ASSET_SIZE }],
  });
  for (const { account: { data } } of proxyAssets) {
    // Proxy Asset: stablecoin_mint[0..32], oracle[32..64], active, bump, feed_id[66..98]
    mintToOracle[new PublicKey(data.slice(0, 32)).toBase58()] = new PublicKey(data.slice(32, 64));
  }

  const rlpAccounts = await connection.getProgramAccounts(RLP_PROGRAM);
  const isDisc = (data, disc) => data.slice(0, 8).equals(disc);
  const pools = [];
  for (const { pubkey, account: { data } } of rlpAccounts) {
    if (isDisc(data, RLP_ASSET_DISC)) {
      // RLP Asset: disc(8) bump(8) index(9) mint[10..42] oracle enum(tag@42, account[43..75])
      const index = data[9];
      const mint = new PublicKey(data.slice(10, 42)).toBase58();
      rlpAssetByIndex[index] = mint;
      mintToOracle[mint] = new PublicKey(data.slice(43, 75));
    } else if (isDisc(data, RLP_POOL_DISC) && TRANCHE_POOL_INDICES.has(data[9])) {
      pools.push({ pubkey, data });
    }
  }

  // --- Collect holdings to value: junior pool ATAs + senior protected vaults ---
  const holdings = []; // { tokenAccount: PublicKey, mint: base58 }
  const seniorProxies = []; // ProxyState PDAs backstopped by an RLP pool
  for (const { pubkey, data } of pools) {
    // LiquidityPool: ... cooldown_duration ends at 58; deposit_cap Option tag @58 (+8 if Some);
    // asset_count; assets[4]; protected_vault Option (tag + 32 if Some).
    let o = 58;
    const capTag = data[o]; o += 1; // deposit_cap Option tag
    if (capTag === 1) o += 8; // deposit_cap value (Some)
    const assetCount = data[o]; o += 1;
    const assetIdxs = [...data.slice(o, o + 4)];
    o += 4;
    const pvTag = data[o]; o += 1; // protected_vault Option tag
    let protectedVault = null;
    if (pvTag === 1) protectedVault = new PublicKey(data.slice(o, o + 32));
    // junior: each pool asset is held in the pool PDA's ATA for that mint
    for (let i = 0; i < assetCount; i++) {
      const mint = rlpAssetByIndex[assetIdxs[i]];
      if (!mint) continue;
      holdings.push({ tokenAccount: ataFor(new PublicKey(mint), pubkey), mint });
    }
    // senior: the pool's protected_vault is the backstopped ProxyState PDA
    if (protectedVault) seniorProxies.push(protectedVault);
  }

  // Senior value: each protected proxy holds its underlying in the ProxyState PDA's ATA.
  if (seniorProxies.length) {
    const uniq = [...new Map(seniorProxies.map((p) => [p.toBase58(), p])).values()];
    const proxyInfos = await getMultipleAccounts(connection, uniq);
    proxyInfos.forEach((info, i) => {
      if (!info || !info.owner.equals(PROXY_PROGRAM) || info.data.length !== PROXY_STATE_SIZE) return;
      const stablecoinMint = new PublicKey(info.data.slice(32, 64)); // ProxyState.stablecoin_mint
      holdings.push({ tokenAccount: ataFor(stablecoinMint, uniq[i]), mint: stablecoinMint.toBase58() });
    });
  }

  if (!holdings.length) return;

  // --- Read all token accounts (amount + mint), then price each via its oracle ---
  const accInfos = await getMultipleAccounts(connection, holdings.map((h) => h.tokenAccount));
  const priced = [];
  const oracleSet = new Set();
  accInfos.forEach((info, i) => {
    if (!info || info.data.length < 72) return; // missing / not a token account
    const mint = new PublicKey(info.data.slice(0, 32)).toBase58();
    const amount = info.data.readBigUInt64LE(64);
    if (amount === 0n) return;
    const oracle = mintToOracle[mint];
    if (!oracle) return; // no oracle known for this mint -> cannot price
    oracleSet.add(oracle.toBase58());
    priced.push({ mint, amount, oracle });
  });

  const oracleList = [...oracleSet].map((s) => new PublicKey(s));
  const oracleInfos = await getMultipleAccounts(connection, oracleList);
  const priceByOracle = {};
  oracleList.forEach((o, i) => { priceByOracle[o.toBase58()] = parseOraclePrice(oracleInfos[i]); });

  // decimals for each held mint
  const mints = [...new Set(priced.map((p) => p.mint))].map((m) => new PublicKey(m));
  const mintInfos = await getMultipleAccounts(connection, mints);
  const decimalsByMint = {};
  mints.forEach((m, i) => { decimalsByMint[m.toBase58()] = mintInfos[i] ? mintInfos[i].data[44] : 6; });

  for (const { mint, amount, oracle } of priced) {
    const price = priceByOracle[oracle.toBase58()];
    if (!price) continue;
    const decimals = decimalsByMint[mint];
    const usd = (Number(amount) / 10 ** decimals) * price;
    if (usd > 0) api.addUSDValue(usd);
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology:
    "Reflect Tranches TVL sums the senior and junior tranches of the live tranche pool(s) on the RLP program (JrXLmS6aYJNJDVxdAfjNJE5wikT8ubf3TA9iL2JA9Av); a pool-index allowlist restricts it to live tranche pools. Junior = the underlying assets held in the RLP liquidity pool (the pool PDA's per-asset token accounts). Senior = the Reflect Proxy Program (pRoxYU64BSjv8HbhENna8a7LVCrkzzNrnvbYuTwas8C) vault the pool backstops (protected_vault), so only RLP-backstopped proxies are counted. The underlying is a yield-bearing stablecoin priced via its on-chain Pyth oracle and added as USD. Those same deposits are also counted in the underlying yield source's TVL, so TVL is marked doublecounted.",
  solana: { tvl },
};
