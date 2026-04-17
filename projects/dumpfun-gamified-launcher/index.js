// Mining Launcher - Gamified Mining Launchpad on Solana
// Anyone can launch a mining token. Users deploy SOL to a 5x5 grid per game,
// winners chosen via VRF. Per-round reset: 87% winner, 1% creator,
// 10% buy-and-burn, 0.5% platform fee, 1.4% per-token motherlode, 0.1% global motherlode.

const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");

// Mining launcher program (same ID on devnet and mainnet)
const PROGRAM_ID = new PublicKey("Minefw2Nic7LBvSw9rN59e8wycUzrKMBF2PZzFHKsqd");

// Anchor discriminators: sha256("account:<Name>")[0:8]
const DISC_MINING_BOARD      = Buffer.from([167, 142, 34, 6, 66, 173, 50, 139]);
const DISC_MINING_ROUND      = Buffer.from([120, 38, 226, 94, 243, 8, 166, 118]);
const DISC_GLOBAL_MOTHERLODE = Buffer.from([213, 4, 99, 100, 201, 16, 199, 80]);
const DISC_MINER             = Buffer.from([223, 113, 15, 54, 123, 122, 140, 100]);

// Fixed Anchor account sizes (from programs/mining_launcher/src/states.rs).
// Supplied as a `dataSize` filter so the RPC can prune by size before returning.
const SIZE_MINING_BOARD      = 100;
const SIZE_MINING_ROUND      = 600;
const SIZE_GLOBAL_MOTHERLODE = 448;
const SIZE_MINER             = 600;

const encode = bs58.default ? bs58.default.encode : bs58.encode;
function accountFilters(disc, dataSize) {
  return [
    { memcmp: { offset: 0, bytes: encode(disc) } },
    { dataSize },
  ];
}

async function tvl(api) {
  const connection = getConnection();

  // SOL-holding PDAs: only need pubkey, not data.
  // NOTE: Miner PDAs grow O(users * games). `getProgramAccounts` is
  // unpaginated and most public RPCs cap at ~10k-100k accounts; the
  // `dataSize` filter helps the node prune, but monitor Miner growth.
  const [boards, rounds, motherlodes, miners] = await Promise.all([
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: accountFilters(DISC_MINING_BOARD, SIZE_MINING_BOARD),
      dataSlice: { offset: 0, length: 0 },
    }),
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: accountFilters(DISC_MINING_ROUND, SIZE_MINING_ROUND),
      dataSlice: { offset: 0, length: 0 },
    }),
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: accountFilters(DISC_GLOBAL_MOTHERLODE, SIZE_GLOBAL_MOTHERLODE),
      dataSlice: { offset: 0, length: 0 },
    }),
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: accountFilters(DISC_MINER, SIZE_MINER),
      dataSlice: { offset: 0, length: 0 },
    }),
  ]);

  const solOwners = [
    ...boards.map(({ pubkey }) => pubkey.toBase58()),
    ...rounds.map(({ pubkey }) => pubkey.toBase58()),
    ...motherlodes.map(({ pubkey }) => pubkey.toBase58()),
    ...miners.map(({ pubkey }) => pubkey.toBase58()),
  ];

  await sumTokens2({ api, solOwners });
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL counts SOL locked in the mining_launcher program: active mining " +
    "rounds (user deposits on the 5x5 grid), mining board PDAs (per-token " +
    "motherlode jackpot and buy-and-burn escrow), the global motherlode " +
    "jackpot (cross-game), and miner PDAs (checkpointed but unclaimed user " +
    "rewards). All games are discovered dynamically via on-chain program " +
    "accounts. Protocol fees (0.5% deploy fee + 0.5% reset fee) accrue to a " +
    "separate treasury wallet (jAvSW1LeQGauZ3rRkR8ysaH4ag3yAheX7vGGTb926vy) " +
    "and are NOT included in TVL, per DefiLlama convention excluding " +
    "protocol-owned liquidity.",
  solana: {
    tvl,
  },
};
