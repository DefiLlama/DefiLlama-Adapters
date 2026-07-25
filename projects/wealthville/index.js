const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } = require("../helper/solana");
const { addUniV3LikePosition } = require("../helper/unwrapLPs");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

// WealthVille is a non-custodial yield optimizer on Solana. Each vault is a PDA of the
// smart_vault program that deploys user deposits across several venues. TVL is computed
// fully on-chain by discovering every vault PDA and valuing what it holds:
//
//   1. Idle SPL balances + native SOL (incl. JitoSOL liquid-staking receipts)   -> sumTokens2
//   2. Orca Whirlpool concentrated-liquidity positions                          -> position NFT
//   3. Raydium CLMM concentrated-liquidity positions                            -> position NFT
//   4. Meteora DLMM bin-liquidity positions                                     -> program-owned account
//   5. Jupiter Perpetuals collateral (in the per-vault jupiter_owner PDA):
//        idle SOL/tokens in that PDA + the open position's on-chain collateralUsd
//
// Everything is read from mainnet state (no project API), so the number is independently
// verifiable. Venues a vault is not currently using contribute nothing.
const SMART_VAULT_PROGRAM = new PublicKey("6dtupVYfD3UP6mEsBxExfHeiBNojC4QNHSysYNewkaGu");
// Anchor account discriminator for the smart_vault `Vault` struct.
const VAULT_DISCRIMINATOR = bs58.encode(Buffer.from("dae002b6f091b8d7", "hex"));

const WHIRLPOOL_PROGRAM = new PublicKey("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc");
const RAYDIUM_CLMM_PROGRAM = new PublicKey("CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK");
const DLMM_PROGRAM = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");
const JUP_PERP_PROGRAM = new PublicKey("PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu");

const POSITION_SEED = Buffer.from("position");
const JUPITER_OWNER_SEED = Buffer.from("jupiter_owner");

// Anchor discriminators (first 8 bytes of sha256("account:<Name>")).
const DLMM_POSITION_V2_DISC = bs58.encode(Buffer.from([117, 176, 212, 199, 245, 180, 133, 182]));
const DLMM_BIN_ARRAY_DISC = bs58.encode(Buffer.from([92, 142, 92, 220, 5, 148, 70, 181]));
const JUP_POSITION_DISC = bs58.encode(Buffer.from([170, 188, 143, 228, 122, 64, 247, 208]));

const readU128LE = (d, o) => d.readBigUInt64LE(o) + (d.readBigUInt64LE(o + 8) << 64n);
const readI64LE = (d, o) => { const v = d.readBigUInt64LE(o); return v >= 0x8000000000000000n ? v - 0x10000000000000000n : v; };
const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };

async function getMulti(conn, keys) {
  const out = [];
  for (const c of chunk(keys, 100)) out.push(...await conn.getMultipleAccountsInfo(c));
  return out;
}

// NFT position receipts (balance 1) held by `owner` across both token programs.
async function getOwnerNftMints(conn, owner) {
  const [t1, t2] = await Promise.all([
    conn.getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }),
    conn.getTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }),
  ]);
  const nfts = [];
  for (const { account } of [...t1.value, ...t2.value]) {
    const d = account.data;                 // raw SPL Account: mint[0..32], amount u64 @64
    if (d.readBigUInt64LE(64) === 1n) nfts.push(new PublicKey(d.slice(0, 32)));
  }
  return nfts;
}

// Orca Whirlpool + Raydium CLMM: both key a personal position PDA by ["position", nftMint]
// under their program, both expose (whirlpool/pool, liquidity, tickLower, tickUpper), and
// both value via the shared Uniswap-v3-style liquidity math.
async function addClmmPositions(api, conn, nftMintsByOwner) {
  const cands = [];
  for (const mints of nftMintsByOwner) {
    for (const mint of mints) {
      cands.push({ key: PublicKey.findProgramAddressSync([POSITION_SEED, mint.toBuffer()], WHIRLPOOL_PROGRAM)[0], dex: "orca" });
      cands.push({ key: PublicKey.findProgramAddressSync([POSITION_SEED, mint.toBuffer()], RAYDIUM_CLMM_PROGRAM)[0], dex: "raydium" });
    }
  }
  if (!cands.length) return;
  const infos = await getMulti(conn, cands.map((c) => c.key));

  const poolSet = new Set();
  const positions = [];
  infos.forEach((info, i) => {
    if (!info) return;
    const d = info.data;
    if (cands[i].dex === "orca" && info.owner.equals(WHIRLPOOL_PROGRAM)) {
      // Whirlpool Position: whirlpool[8..40], liquidity u128 @72, tickLower i32 @88, tickUpper i32 @92
      const pool = new PublicKey(d.slice(8, 40)).toBase58();
      positions.push({ pool, liquidity: Number(readU128LE(d, 72)), tickLower: d.readInt32LE(88), tickUpper: d.readInt32LE(92) });
      poolSet.add(pool);
    } else if (cands[i].dex === "raydium" && info.owner.equals(RAYDIUM_CLMM_PROGRAM)) {
      // Raydium PersonalPosition: poolId[41..73], tickLower i32 @73, tickUpper i32 @77, liquidity u128 @81
      const pool = new PublicKey(d.slice(41, 73)).toBase58();
      positions.push({ pool, liquidity: Number(readU128LE(d, 81)), tickLower: d.readInt32LE(73), tickUpper: d.readInt32LE(77) });
      poolSet.add(pool);
    }
  });
  if (!positions.length) return;

  const poolKeys = [...poolSet];
  const poolInfos = await getMulti(conn, poolKeys.map((k) => new PublicKey(k)));
  const pools = {};
  poolKeys.forEach((k, i) => {
    const info = poolInfos[i];
    if (!info) return;
    const d = info.data;
    if (info.owner.equals(WHIRLPOOL_PROGRAM)) {
      // Whirlpool: tickCurrentIndex i32 @81, tokenMintA[101..133], tokenMintB[181..213]
      pools[k] = { token0: new PublicKey(d.slice(101, 133)).toBase58(), token1: new PublicKey(d.slice(181, 213)).toBase58(), tick: d.readInt32LE(81) };
    } else {
      // Raydium CLMM PoolState: mintA[73..105], mintB[105..137], tickCurrent i32 @269
      pools[k] = { token0: new PublicKey(d.slice(73, 105)).toBase58(), token1: new PublicKey(d.slice(105, 137)).toBase58(), tick: d.readInt32LE(269) };
    }
  });

  for (const p of positions) {
    const pool = pools[p.pool];
    if (!pool) continue;
    addUniV3LikePosition({ api, token0: pool.token0, token1: pool.token1, liquidity: p.liquidity, tickLower: p.tickLower, tickUpper: p.tickUpper, tick: pool.tick });
  }
}

// Meteora DLMM: positions are program-owned accounts (owner pubkey at offset 40). A position
// holds `liquidityShares` per bin over [lowerBinId, upperBinId]; the underlying token amount in
// each bin is share * binReserve / binLiquiditySupply, read from the pool's on-chain BinArrays.
async function addDlmmPositions(api, conn, owner) {
  const posAccs = await conn.getProgramAccounts(DLMM_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: DLMM_POSITION_V2_DISC } }, { memcmp: { offset: 40, bytes: owner.toBase58() } }],
  });
  for (const { account } of posAccs) {
    const d = account.data;
    // PositionV2: lbPair[8..40], liquidityShares u128[70] @72, lowerBinId i32 @7912, upperBinId i32 @7916
    const lbPair = new PublicKey(d.slice(8, 40));
    const lowerBinId = d.readInt32LE(7912);
    const upperBinId = d.readInt32LE(7916);

    const [pairInfo, binAccs] = await Promise.all([
      conn.getAccountInfo(lbPair),
      conn.getProgramAccounts(DLMM_PROGRAM, {
        filters: [{ memcmp: { offset: 0, bytes: DLMM_BIN_ARRAY_DISC } }, { memcmp: { offset: 24, bytes: lbPair.toBase58() } }],
      }),
    ]);
    if (!pairInfo) continue;
    // LbPair: tokenXMint[88..120], tokenYMint[120..152]
    const tokenX = new PublicKey(pairInfo.data.slice(88, 120)).toBase58();
    const tokenY = new PublicKey(pairInfo.data.slice(120, 152)).toBase58();

    // BinArray: indexRaw i64 @8, bins[70] @56; each bin is 144 bytes: amountX u64 @0, amountY u64 @8, liquiditySupply u128 @32
    const bins = new Map();
    for (const { account: ba } of binAccs) {
      const bd = ba.data;
      const base = Number(readI64LE(bd, 8)) * 70;
      for (let i = 0; i < 70; i++) {
        const off = 56 + i * 144;
        bins.set(base + i, { amountX: bd.readBigUInt64LE(off), amountY: bd.readBigUInt64LE(off + 8), supply: readU128LE(bd, off + 32) });
      }
    }

    let amountX = 0n, amountY = 0n;
    for (let binId = lowerBinId; binId <= upperBinId; binId++) {
      const share = readU128LE(d, 72 + (binId - lowerBinId) * 16);
      if (share === 0n) continue;
      const bin = bins.get(binId);
      if (!bin || bin.supply === 0n) continue;
      amountX += (share * bin.amountX) / bin.supply;
      amountY += (share * bin.amountY) / bin.supply;
    }
    if (amountX > 0n) api.add(tokenX, amountX.toString());
    if (amountY > 0n) api.add(tokenY, amountY.toString());
  }
}

// Jupiter Perpetuals: the vault opens positions through a per-vault `jupiter_owner` PDA. The
// deployed collateral lives inside Jupiter's custody, recorded on the Position account as
// `collateralUsd` (u64, 1e6 scale). Idle SOL/tokens in the jupiter_owner PDA are picked up by
// sumTokens2 (its PDA is in the owners list); here we add the in-position collateral.
async function addJupiterCollateral(api, conn, jupiterOwner) {
  const posAccs = await conn.getProgramAccounts(JUP_PERP_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: JUP_POSITION_DISC } }, { memcmp: { offset: 8, bytes: jupiterOwner.toBase58() } }],
  });
  for (const { account } of posAccs) {
    const collateralUsd = Number(account.data.readBigUInt64LE(169)) / 1e6; // Position.collateralUsd
    if (collateralUsd > 0) api.addUSDValue(collateralUsd);
  }
}

async function tvl(api) {
  const conn = getConnection();

  const vaultAccs = await conn.getProgramAccounts(SMART_VAULT_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: VAULT_DISCRIMINATOR } }],
    dataSlice: { offset: 0, length: 0 },
  });
  const vaults = vaultAccs.map((a) => a.pubkey);
  const jupiterOwners = vaults.map((v) => PublicKey.findProgramAddressSync([JUPITER_OWNER_SEED, v.toBuffer()], SMART_VAULT_PROGRAM)[0]);

  // (1) idle SPL + native SOL for every vault PDA and every jupiter_owner PDA (WSOL/USDC
  //     collateral sitting in the perp owner's ATAs, plus its native SOL, are counted here).
  const owners = [...vaults, ...jupiterOwners].map((k) => k.toBase58());
  await sumTokens2({ api, owners, solOwners: owners });

  // (2)+(3) Orca Whirlpool & Raydium CLMM positions, keyed off NFTs held by each vault PDA.
  const nftMintsByOwner = await Promise.all(vaults.map((v) => getOwnerNftMints(conn, v)));
  await addClmmPositions(api, conn, nftMintsByOwner);

  // (4) Meteora DLMM positions owned by each vault PDA.
  for (const v of vaults) await addDlmmPositions(api, conn, v);

  // (5) Jupiter Perpetuals in-position collateral for each jupiter_owner PDA.
  for (const jo of jupiterOwners) await addJupiterCollateral(api, conn, jo);
}

module.exports = {
  methodology:
    "TVL is read entirely from Solana mainnet state. WealthVille smart-vault PDAs are discovered on-chain, then valued across: idle SPL balances and native SOL (including JitoSOL liquid-staking receipts), Orca Whirlpool and Raydium CLMM concentrated-liquidity positions (unwrapped from position NFTs), Meteora DLMM bin-liquidity positions (unwrapped from on-chain bin reserves), and Jupiter Perpetuals collateral (idle balances in the per-vault jupiter_owner PDA plus the open position's on-chain collateralUsd).",
  timetravel: false,
  solana: { tvl },
};
