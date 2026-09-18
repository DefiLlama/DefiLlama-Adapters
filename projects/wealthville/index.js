const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, getMultipleAccounts, decodeAccount, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } = require("../helper/solana");
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
const BIN_ARRAY_SEED = Buffer.from("bin_array");
const BINS_PER_ARRAY = 70;

// Anchor discriminators (first 8 bytes of sha256("account:<Name>")).
const DLMM_POSITION_V2_DISC = bs58.encode(Buffer.from([117, 176, 212, 199, 245, 180, 133, 182]));
const JUP_POSITION_DISC = bs58.encode(Buffer.from([170, 188, 143, 228, 122, 64, 247, 208]));

// A single pass over the owners' SPL accounts yields both things we need from them: the
// position-NFT receipts (balance exactly 1) that key the CLMM positions, and the funded token
// accounts carrying idle balances. Scanning once avoids re-reading the same accounts per use.
async function scanTokenAccounts(conn, owners) {
  const queries = owners.flatMap((owner, ownerIndex) => [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID].map((programId) => ({ owner, ownerIndex, programId })));
  const results = await Promise.all(queries.map((q) => conn.getTokenAccountsByOwner(q.owner, { programId: q.programId })));

  const nftMints = owners.map(() => []);
  const tokenAccounts = [];
  results.forEach((res, i) => {
    for (const { pubkey, account } of res.value) {
      const d = account.data;               // raw SPL Account: mint[0..32], amount u64 @64
      const amount = d.readBigUInt64LE(64);
      if (amount === 1n) nftMints[queries[i].ownerIndex].push(new PublicKey(d.slice(0, 32)));
      else if (amount > 0n) tokenAccounts.push(pubkey.toBase58());
    }
  });
  return { nftMints, tokenAccounts };
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
  const infos = await getMultipleAccounts(cands.map((c) => c.key));

  const poolSet = new Set();
  const positions = [];
  infos.forEach((info, i) => {
    if (!info) return;
    if (cands[i].dex === "orca" && info.owner.equals(WHIRLPOOL_PROGRAM)) {
      // Whirlpool Position: whirlpool[8..40], liquidity u128 @72, tickLower i32 @88, tickUpper i32 @92
      const d = info.data;
      const pool = new PublicKey(d.slice(8, 40)).toBase58();
      const liquidity = Number(d.readBigUInt64LE(72) + (d.readBigUInt64LE(80) << 64n));
      positions.push({ pool, liquidity, tickLower: d.readInt32LE(88), tickUpper: d.readInt32LE(92) });
      poolSet.add(pool);
    } else if (cands[i].dex === "raydium" && info.owner.equals(RAYDIUM_CLMM_PROGRAM)) {
      const p = decodeAccount("raydiumPositionInfo", info);
      const pool = p.poolId.toBase58();
      positions.push({ pool, liquidity: Number(p.liquidity.toString()), tickLower: p.tickLower, tickUpper: p.tickUpper });
      poolSet.add(pool);
    }
  });
  if (!positions.length) return;

  const poolKeys = [...poolSet];
  const poolInfos = await getMultipleAccounts(poolKeys.map((k) => new PublicKey(k)));
  const pools = {};
  poolKeys.forEach((k, i) => {
    const info = poolInfos[i];
    if (!info) return;
    if (info.owner.equals(WHIRLPOOL_PROGRAM)) {
      // Whirlpool: tickCurrentIndex i32 @81, tokenMintA[101..133], tokenMintB[181..213]
      const d = info.data;
      pools[k] = { token0: new PublicKey(d.slice(101, 133)).toBase58(), token1: new PublicKey(d.slice(181, 213)).toBase58(), tick: d.readInt32LE(81) };
    } else {
      const s = decodeAccount("raydiumCLMM", info);
      pools[k] = { token0: s.mintA.toBase58(), token1: s.mintB.toBase58(), tick: s.tickCurrent };
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
// each bin is share * binReserve / binLiquiditySupply, read from the pair's on-chain BinArrays.
// A BinArray is a PDA of ["bin_array", lbPair, i64 index] covering BINS_PER_ARRAY bins, so the
// arrays a position spans are derived rather than searched for, and every pair and array the
// vaults touch is then read in one batched call.
async function addDlmmPositions(api, conn, owners) {
  const found = (await Promise.all(owners.map((owner) => conn.getProgramAccounts(DLMM_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: DLMM_POSITION_V2_DISC } }, { memcmp: { offset: 40, bytes: owner.toBase58() } }],
  })))).flat();

  const positions = [];
  const pairKeys = new Set(), binArrayKeys = new Set();
  for (const { account } of found) {
    const p = decodeAccount("meteoraPosition", account);
    const lbPair = p.lbPair.toBase58();
    const arrays = [];
    for (let i = Math.floor(p.lowerBinId / BINS_PER_ARRAY); i <= Math.floor(p.upperBinId / BINS_PER_ARRAY); i++) {
      const seed = Buffer.alloc(8);
      seed.writeBigInt64LE(BigInt(i));
      const key = PublicKey.findProgramAddressSync([BIN_ARRAY_SEED, p.lbPair.toBuffer(), seed], DLMM_PROGRAM)[0].toBase58();
      arrays.push(key);
      binArrayKeys.add(key);
    }
    pairKeys.add(lbPair);
    positions.push({ position: p, lbPair, arrays });
  }
  if (!positions.length) return;

  const keys = [...pairKeys, ...binArrayKeys];
  const infos = await getMultipleAccounts(keys.map((k) => new PublicKey(k)));
  const accounts = {};
  keys.forEach((k, i) => { if (infos[i]) accounts[k] = infos[i]; });

  for (const { position, lbPair, arrays } of positions) {
    if (!accounts[lbPair]) continue;
    const pair = decodeAccount("meteoraLbPair", accounts[lbPair]);

    const bins = new Map();
    for (const key of arrays) {
      if (!accounts[key]) continue;
      const binArray = decodeAccount("meteoraBinArray", accounts[key]);
      const base = Number(binArray.index) * BINS_PER_ARRAY;
      binArray.bins.forEach((bin, i) => bins.set(base + i, bin));
    }

    let amountX = 0n, amountY = 0n;
    for (let binId = position.lowerBinId; binId <= position.upperBinId; binId++) {
      const share = BigInt(position.liquidityShares[binId - position.lowerBinId].toString());
      if (share === 0n) continue;
      const bin = bins.get(binId);
      if (!bin) continue;
      const supply = BigInt(bin.liquiditySupply.toString());
      if (supply === 0n) continue;
      amountX += (share * BigInt(bin.amountX.toString())) / supply;
      amountY += (share * BigInt(bin.amountY.toString())) / supply;
    }
    if (amountX > 0n) api.add(pair.tokenXMint.toBase58(), amountX.toString());
    if (amountY > 0n) api.add(pair.tokenYMint.toBase58(), amountY.toString());
  }
}

// Jupiter Perpetuals: the vault opens positions through a per-vault `jupiter_owner` PDA. The
// deployed collateral lives inside Jupiter's custody, recorded on the Position account as
// `collateralUsd` (u64, 1e6 scale). Idle SOL/tokens in the jupiter_owner PDA are picked up by
// sumTokens2 (its PDA is in the owners list); here we add the in-position collateral.
async function addJupiterCollateral(api, conn, jupiterOwners) {
  const found = (await Promise.all(jupiterOwners.map((owner) => conn.getProgramAccounts(JUP_PERP_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: JUP_POSITION_DISC } }, { memcmp: { offset: 8, bytes: owner.toBase58() } }],
  })))).flat();
  for (const { account } of found) {
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

  // The jupiter_owner PDA is created and funded the first time a vault opens a perp position,
  // so the ones that were never initialised hold nothing and have no position to read.
  const jupiterOwnerPdas = vaults.map((v) => PublicKey.findProgramAddressSync([JUPITER_OWNER_SEED, v.toBuffer()], SMART_VAULT_PROGRAM)[0]);
  const jupiterOwnerInfos = await getMultipleAccounts(jupiterOwnerPdas);
  const jupiterOwners = jupiterOwnerPdas.filter((_, i) => jupiterOwnerInfos[i]);

  const owners = [...vaults, ...jupiterOwners];
  const { nftMints, tokenAccounts } = await scanTokenAccounts(conn, owners);

  // (1) idle SPL + native SOL for every vault PDA and every jupiter_owner PDA (WSOL/USDC
  //     collateral sitting in the perp owner's ATAs, plus its native SOL, are counted here).
  await sumTokens2({ api, tokenAccounts, solOwners: owners.map((k) => k.toBase58()) });

  // (2)+(3) Orca Whirlpool & Raydium CLMM positions, keyed off NFTs held by each vault PDA.
  await addClmmPositions(api, conn, nftMints.slice(0, vaults.length));

  // (4) Meteora DLMM positions owned by each vault PDA.
  await addDlmmPositions(api, conn, vaults);

  // (5) Jupiter Perpetuals in-position collateral for each jupiter_owner PDA.
  await addJupiterCollateral(api, conn, jupiterOwners);
}

module.exports = {
  methodology:
    "TVL is read entirely from Solana mainnet state. WealthVille smart-vault PDAs are discovered on-chain, then valued across: idle SPL balances and native SOL (including JitoSOL liquid-staking receipts), Orca Whirlpool and Raydium CLMM concentrated-liquidity positions (unwrapped from position NFTs), Meteora DLMM bin-liquidity positions (unwrapped from on-chain bin reserves), and Jupiter Perpetuals collateral (idle balances in the per-vault jupiter_owner PDA plus the open position's on-chain collateralUsd).",
  timetravel: false,
  solana: { tvl },
};
