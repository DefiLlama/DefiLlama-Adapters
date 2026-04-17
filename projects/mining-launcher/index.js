// Mining Launcher - Gamified Mining Launchpad on Solana
// Anyone can launch a mining token. Users deploy SOL to a 5x5 grid per game,
// winners chosen via VRF. Per-round reset: 87% winner, 1% creator,
// 10% buy-and-burn, 0.5% platform fee, 1.4% per-token motherlode, 0.1% global motherlode.

const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");

// Mining launcher program (same ID on devnet and mainnet)
const PROGRAM_ID = new PublicKey("Minefw2Nic7LBvSw9rN59e8wycUzrKMBF2PZzFHKsqd");

// Mainnet protocol fee receiver (passive treasury wallet, compile-time constant
// in the program under `--features mainnet`). Receives PROTOCOL_FEE_BPS (0.5%)
// on every deploy and PLATFORM_RESET_FEE_BPS (0.5%) on every round reset.
const PROTOCOL_FEE_RECEIVER = "jAvSW1LeQGauZ3rRkR8ysaH4ag3yAheX7vGGTb926vy";

// Anchor discriminators: sha256("account:<Name>")[0:8]
const DISC_MINING_BOARD      = Buffer.from([167, 142, 34, 6, 66, 173, 50, 139]);
const DISC_MINING_ROUND      = Buffer.from([120, 38, 226, 94, 243, 8, 166, 118]);
const DISC_GLOBAL_MOTHERLODE = Buffer.from([213, 4, 99, 100, 201, 16, 199, 80]);
const DISC_MINER             = Buffer.from([223, 113, 15, 54, 123, 122, 140, 100]);

const encode = bs58.default ? bs58.default.encode : bs58.encode;
function discFilter(disc) {
  return [{ memcmp: { offset: 0, bytes: encode(disc) } }];
}

async function tvl(api) {
  const connection = getConnection();

  // SOL-holding PDAs: only need pubkey, not data
  const [boards, rounds, motherlodes, miners] = await Promise.all([
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: discFilter(DISC_MINING_BOARD),
      dataSlice: { offset: 0, length: 0 },
    }),
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: discFilter(DISC_MINING_ROUND),
      dataSlice: { offset: 0, length: 0 },
    }),
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: discFilter(DISC_GLOBAL_MOTHERLODE),
      dataSlice: { offset: 0, length: 0 },
    }),
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: discFilter(DISC_MINER),
      dataSlice: { offset: 0, length: 0 },
    }),
  ]);

  const solOwners = [
    ...boards.map(({ pubkey }) => pubkey.toBase58()),
    ...rounds.map(({ pubkey }) => pubkey.toBase58()),
    ...motherlodes.map(({ pubkey }) => pubkey.toBase58()),
    ...miners.map(({ pubkey }) => pubkey.toBase58()),
    PROTOCOL_FEE_RECEIVER,
  ];

  await sumTokens2({ api, solOwners });
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL counts SOL locked in the mining_launcher program plus the protocol " +
    "treasury: active mining rounds (user deposits on the 5x5 grid), mining " +
    "board PDAs (per-token motherlode jackpot and buy-and-burn escrow), the " +
    "global motherlode jackpot (cross-game), miner PDAs (checkpointed but " +
    "unclaimed user rewards), and the protocol fee receiver wallet " +
    "(accumulates 0.5% deploy fee + 0.5% reset fee). All games are " +
    "discovered dynamically via on-chain program accounts.",
  solana: {
    tvl,
  },
};
