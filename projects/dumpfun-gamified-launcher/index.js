const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey("Minefw2Nic7LBvSw9rN59e8wycUzrKMBF2PZzFHKsqd");

const ACCOUNT_TYPES = [
  { disc: [167, 142, 34, 6, 66, 173, 50, 139], size: 100 },  // MiningBoard
  { disc: [120, 38, 226, 94, 243, 8, 166, 118], size: 600 },  // MiningRound
  { disc: [213, 4, 99, 100, 201, 16, 199, 80],  size: 448 },  // GlobalMotherlode
  { disc: [223, 113, 15, 54, 123, 122, 140, 100], size: 600 }, // Miner
]

function accountFilters({ disc, size }) {
  return [
    { memcmp: { offset: 0, bytes: Buffer.from(disc).toString('base64'), encoding: 'base64' } },
    { dataSize: size },
  ];
}

async function tvl(api) {
  const connection = getConnection();
  const accounts = await Promise.all(
    ACCOUNT_TYPES.map(type => connection.getProgramAccounts(PROGRAM_ID, {
      filters: accountFilters(type),
      dataSlice: { offset: 0, length: 0 },
    }))
  );
  const solOwners = accounts.flat().map(({ pubkey }) => pubkey.toBase58());
  await sumTokens2({ api, solOwners });
}

module.exports = {
  timetravel: false,
  methodology: "TVL counts SOL locked in mining_launcher program PDAs: active rounds, mining boards, global motherlode, and unclaimed miner rewards.",
  solana: { tvl },
};