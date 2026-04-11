const { getLogs } = require("../helper/cache/getLogs");

const CONTRACTS = {
  bsc: {
    address: "0x95c2aE48Bd760d330b8D76DbE554F44b0D642021",
    fromBlock: 38000000,
  },
  base: {
    address: "0x8A55a880C8C54952996b28129dDf94919a143A44",
    fromBlock: 24000000,
  },
  ethereum: {
    address: "0xcFFFE014D093d6131A1F1D321C8A1fDcdd92de73",
    fromBlock: 21500000,
  },
  polygon: {
    address: "0xc041F30510a7524541aBF364E104f211ebaD5E8b",
    fromBlock: 66000000,
  },
  arbitrum: {
    address: "0xc041F30510a7524541aBF364E104f211ebaD5E8b",
    fromBlock: 290000000,
  },
  optimism: {
    address: "0x2B343FE5d93B92939Ebf26EDBe7f248f5e029695",
    fromBlock: 130000000,
  },
};

const NATIVE_TOKENS = {
  bsc: "coingecko:binancecoin",
  base: "coingecko:ethereum",
  ethereum: "coingecko:ethereum",
  polygon: "coingecko:matic-network",
  arbitrum: "coingecko:ethereum",
  optimism: "coingecko:ethereum",
};

const DEPOSIT_EVENT = "event Deposited(address indexed owner, uint256 amount)";
const WITHDRAW_EVENT = "event Withdrawn(address indexed owner, uint256 amount)";
const CLAIMED_EVENT =
  "event InheritanceClaimed(address indexed heir, address indexed owner, uint256 amount)";

async function getChainTVL(api, chain) {
  const contract = CONTRACTS[chain];
  const { address, fromBlock } = contract;

  const [deposits, withdrawals, claims] = await Promise.all([
    getLogs({ api, target: address, fromBlock, eventAbi: DEPOSIT_EVENT }),
    getLogs({ api, target: address, fromBlock, eventAbi: WITHDRAW_EVENT }),
    getLogs({ api, target: address, fromBlock, eventAbi: CLAIMED_EVENT }),
  ]);

  let totalDeposited = BigInt(0);
  let totalWithdrawn = BigInt(0);
  let totalClaimed = BigInt(0);

  deposits.forEach((log) => {
    totalDeposited += BigInt(log.amount.toString());
  });

  withdrawals.forEach((log) => {
    totalWithdrawn += BigInt(log.amount.toString());
  });

  claims.forEach((log) => {
    totalClaimed += BigInt(log.amount.toString());
  });

  let tvl = totalDeposited - totalWithdrawn - totalClaimed;

  if (tvl < 0n) {
    console.warn(
      `Negative TVL computed for ${chain}: deposited=${totalDeposited}, withdrawn=${totalWithdrawn}, claimed=${totalClaimed}. Setting to 0.`
    );
    tvl = 0n;
  }

  // Convert from Wei (18 decimals) to human readable
  const tvlInEther = Number(tvl) / 1e18;

  const balances = {};
  balances[NATIVE_TOKENS[chain]] = tvlInEther;

  return balances;
}

module.exports = {
  methodology:
    "TVL is calculated by summing all native token deposits into MOKEE vaults across all supported chains, minus withdrawals and claimed inheritances.",
  bsc: {
    tvl: (api) => getChainTVL(api, "bsc"),
  },
  base: {
    tvl: (api) => getChainTVL(api, "base"),
  },
  ethereum: {
    tvl: (api) => getChainTVL(api, "ethereum"),
  },
  polygon: {
    tvl: (api) => getChainTVL(api, "polygon"),
  },
  arbitrum: {
    tvl: (api) => getChainTVL(api, "arbitrum"),
  },
  optimism: {
    tvl: (api) => getChainTVL(api, "optimism"),
  },
};
