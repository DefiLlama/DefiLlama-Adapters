const { sumSingleBalance } = require("../helper/balance");
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

const DEPOSIT_EVENT =
  "event Deposited(address indexed owner, uint256 amount)";
const WITHDRAW_EVENT =
  "event Withdrawn(address indexed owner, uint256 amount)";
const CLAIMED_EVENT =
  "event InheritanceClaimed(address indexed heir, address indexed owner, uint256 amount)";

async function getChainTVL(chain, contract) {
  const { address, fromBlock } = contract;
  const api = this;

  const deposits = await getLogs({
    api,
    target: address,
    fromBlock,
    eventAbi: DEPOSIT_EVENT,
  });

  const withdrawals = await getLogs({
    api,
    target: address,
    fromBlock,
    eventAbi: WITHDRAW_EVENT,
  });

  const claims = await getLogs({
    api,
    target: address,
    fromBlock,
    eventAbi: CLAIMED_EVENT,
  });

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

  const tvl = totalDeposited - totalWithdrawn - totalClaimed;

  const nativeTokens = {
    bsc: "bsc",
    base: "base",
    ethereum: "ethereum",
    polygon: "polygon",
    arbitrum: "arbitrum",
    optimism: "optimism",
  };

  const nativeToken = `coingecko:${nativeTokens[chain] === "bsc" ? "binancecoin" : nativeTokens[chain] === "polygon" ? "matic-network" : nativeTokens[chain] === "base" || nativeTokens[chain] === "optimism" || nativeTokens[chain] === "arbitrum" ? "ethereum" : nativeTokens[chain]}`;

  const balances = {};
  sumSingleBalance(balances, nativeToken, tvl.toString(), 18);

  return balances;
}

module.exports = {
  methodology:
    "TVL is calculated by summing all native token deposits into MOKEE vaults across all supported chains, minus withdrawals and claimed inheritances.",
  bsc: {
    tvl: async (api) =>
      getChainTVL.call(api, "bsc", CONTRACTS.bsc),
  },
  base: {
    tvl: async (api) =>
      getChainTVL.call(api, "base", CONTRACTS.base),
  },
  ethereum: {
    tvl: async (api) =>
      getChainTVL.call(api, "ethereum", CONTRACTS.ethereum),
  },
  polygon: {
    tvl: async (api) =>
      getChainTVL.call(api, "polygon", CONTRACTS.polygon),
  },
  arbitrum: {
    tvl: async (api) =>
      getChainTVL.call(api, "arbitrum", CONTRACTS.arbitrum),
  },
  optimism: {
    tvl: async (api) =>
      getChainTVL.call(api, "optimism", CONTRACTS.optimism),
  },
};
