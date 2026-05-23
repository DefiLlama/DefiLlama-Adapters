const { getLogs2 } = require("../helper/cache/getLogs");
const ADDRESSES = require("../helper/coreAssets.json");

const SHOWDOWN_CONTRACTS = {
  MONEYGAMES: { address: "0x7B8DF4195eda5b193304eeCB5107DE18b6557D24", fromBlock: 6238852, },
  TOURNAMENTS: { address: "0x130A8Da14C998C0fC23c5F5aDa64a318dFD6A805", fromBlock: 11578822, },
};

const MATCHFUNDED_EVENT_ABI = "event MatchFunded(bytes16 indexed matchId, address indexed player1, address indexed player2, uint128 amount)";
const REGISTERED_EVENT_ABI = "event Registered(bytes16 indexed tournamentId, address indexed wallet, uint256 amount)";

const USDM = ADDRESSES.megaeth.USDm;
const LOG_CHUNK_SIZE = 100_000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function getLogs2InChunks({ api, target, eventAbi, fromBlock, toBlock }) {
  const logs = [];
  for (let start = fromBlock; start <= toBlock; start += LOG_CHUNK_SIZE) {
    const end = Math.min(start + LOG_CHUNK_SIZE - 1, toBlock);
    const endKey = end === toBlock ? "tail" : `${end}`;
    // Use a unique cache key per block chunk so each chunk is cached and reused independently
    const extraKey = `showdown-${target.toLowerCase()}-${start}-${endKey}`;
    const chunkLogs = await getLogs2({
      api,
      target,
      eventAbi,
      fromBlock: start,
      toBlock: end,
      extraKey,
    });
    logs.push(...chunkLogs);
  }
  return logs;
}

async function getShowdownEmbeddedWallets(api) {
  const toBlock = await api.getBlock();

  const [gameLogs, tournamentLogs] = await Promise.all([
    getLogs2InChunks({
      api,
      target: SHOWDOWN_CONTRACTS.MONEYGAMES.address,
      eventAbi: MATCHFUNDED_EVENT_ABI,
      fromBlock: SHOWDOWN_CONTRACTS.MONEYGAMES.fromBlock,
      toBlock,
    }),
    getLogs2InChunks({
      api,
      target: SHOWDOWN_CONTRACTS.TOURNAMENTS.address,
      eventAbi: REGISTERED_EVENT_ABI,
      fromBlock: SHOWDOWN_CONTRACTS.TOURNAMENTS.fromBlock,
      toBlock,
    }),
  ]);

  const wallets = [
    ...gameLogs.flatMap((log) => [log.player1, log.player2]),
    ...tournamentLogs.map((log) => log.wallet),
  ]
    .filter(Boolean)
    .map((wallet) => wallet.toLowerCase())
    .filter((wallet) => wallet !== ZERO_ADDRESS);

  return [...new Set(wallets)];
}

async function tvl(api) {
  const owners = await getShowdownEmbeddedWallets(api);
  return api.sumTokens({
    owners,
    tokens: [USDM],
  });
}

module.exports = {
  methodology:
    "Sums USDm balances held in Showdown app-specific embedded wallets on MegaETH. Wallets are included only if they have auditable on-chain activity via MatchFunded and Registered events on official Showdown contracts. These contracts are owner-restricted and invoked by the Showdown backend exclusively for Showdown gameplay, so the resulting TVL represents USDm held in historically active Showdown in-game wallets.",
  start: "2026-02-04",
  megaeth: {
    tvl,
  },
};
