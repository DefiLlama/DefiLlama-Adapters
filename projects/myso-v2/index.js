const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { get } = require("../helper/http");
const { getCache, setCache } = require("../helper/cache");

const CoveredCallStrategiesAbi = "function strategies(uint256) view returns (address underlying, uint128 maxDeposits, uint128 minDeposits, uint128 startTime, uint128 tenor, uint128 minStrike, uint128 subscribeEndTime, uint256 totalDeposits, uint128 tokenRewardsPerDeposit)";
const whaleMatchTotalSubscriptionsAbi = "function totalSubscriptions(address) view returns (uint256)";
const NewVaultCreatedAbi = "event NewVaultCreated(address indexed newLenderVaultAddr, address vaultOwner, uint256 numRegisteredVaults)";
const LoanProposalCreatedAbi = "event LoanProposalCreated(address indexed loanProposalAddr, address indexed fundingPool, address indexed sender, address collToken, uint256 arrangerFee, uint256 unsubscribeGracePeriod, uint256 numLoanProposals)"

const CONFIG = {
  mantle:   { fromBlock: 3471026 },
  ethereum: { fromBlock: 18213104 },
  arbitrum: { fromBlock: 143181867 },
  base:     { fromBlock: 6239916 },
  evmos:    { fromBlock: 18112793 },
  neon_evm: { fromBlock: 237206849 },
  telos:    { fromBlock: 324711636 },
  linea:    { fromBlock: 2118418 },
  sei:      { fromBlock: 79773668 },
};


async function loadContracts(api) {
  const url = `https://api.myso.finance/chainIds/${api.chainId}/contracts`;

  const data = await get(url, { responseType: "json", decompress: true, validateStatus: () => true });
  
  if (data && data.contracts && data.contracts.length) {
    await setCache("myso-v2", api.chain, data.contracts);
    return data.contracts;
  }

  const cached = await getCache("myso-v2", api.chain);
  return (cached && cached.length) ? cached : [];
}

async function getBlitzMatchBalances(api, contracts, fromBlock) {
  if (!contracts.length) return;

  const vaultFactory = contracts.find((c) => c && c.type === "vault_factory")?.contractAddr;
  if (!vaultFactory) return;

  const logs = await getLogs({ api,target: vaultFactory, eventAbi: NewVaultCreatedAbi, onlyArgs: true, fromBlock });
  if (!logs.length) return;

  const tokenAddresses = contracts
    .filter((c) => c && c.type === "token" && c.contractAddr)
    .map((c) => c.contractAddr);
  if (!tokenAddresses.length) return;

  const ownerTokens = logs
    .filter((i) => i && i.newLenderVaultAddr)
    .map((i) => [tokenAddresses, i.newLenderVaultAddr]);
  if (!ownerTokens.length) return;

  return sumTokens2({ api, ownerTokens });
}


async function getCoveredCallOfTheWeekBalances(api, contracts) {
  const covered = contracts.filter((c) => c && c.type === "p2p" && c.contractAddr && c.poolData?.strategyId != null);
  if (!covered.length) return;

  const strategies = await api.multiCall({ calls: covered.map((c) => ({ target: c.contractAddr, params: [c.poolData.strategyId] })), abi: CoveredCallStrategiesAbi });
  if (!strategies.length) return;

  strategies.forEach((s) => {
    if (s && s.underlying && s.totalDeposits != null) api.add(s.underlying, s.totalDeposits);
  });
}

async function getWhaleMatchBalances(api, contracts, fromBlock) {
  if (!contracts.length) return;

  const fundingPoolFactory = contracts.find((c) => c && c.type === "funding_pool_factory")?.contractAddr;
  const fundingPools = contracts.filter((c) => c && c.type === "funding_pool");
  if (!(fundingPoolFactory && fundingPools.length)) return;

  const logs = await getLogs({ api, target: fundingPoolFactory, eventAbi: LoanProposalCreatedAbi, onlyArgs: true, fromBlock });

  if (logs.length) {
    const loanProposalBalances = await api.multiCall({
      calls: logs
        .filter((l) => l && l.fundingPool && l.loanProposalAddr)
        .map((l) => ({ target: l.fundingPool, params: [l.loanProposalAddr] })),
      abi: whaleMatchTotalSubscriptionsAbi,
    });

    const tokens = await api.multiCall({ abi: "address:depositToken", calls: logs.filter((l) => l && l.fundingPool).map((l) => l.fundingPool) });

    if (tokens.length === loanProposalBalances.length) api.add(tokens, loanProposalBalances);
  }

  const tokensAndOwners = fundingPools
    .filter((fp) => fp && fp.loanCcyToken && fp.contractAddr)
    .map((fp) => [fp.loanCcyToken, fp.contractAddr]);
  if (!tokensAndOwners.length) return;

  return sumTokens2({ api, tokensAndOwners });
}

async function tvl(api) {
  const fromBlock = CONFIG[api.chain].fromBlock;

  const contracts = await loadContracts(api);
  if (!contracts.length) return;

  await getBlitzMatchBalances(api, contracts, fromBlock);
  await getCoveredCallOfTheWeekBalances(api, contracts);

  return getWhaleMatchBalances(api, contracts, fromBlock);
}

Object.keys(CONFIG).forEach((chain) => {
  if (chain === "neon_evm" || chain === 'sei') return { tvl: () => ({}) };
  module.exports[chain] = { tvl };
});

