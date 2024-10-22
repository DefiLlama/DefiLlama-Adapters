const zlib = require("zlib");
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getCache, setCache } = require("../helper/cache");
const { get } = require("../helper/http");

const brotliDecode = (stream) => {
  return new Promise((resolve, reject) => {
    let responseBuffer = [];

    stream.on("data", function handleStreamData(chunk) {
      responseBuffer.push(chunk);
    });

    stream.on("error", function handleStreamError(err) {
      reject(err);
    });

    stream.on("end", function handleStreamEnd() {
      let responseData = Buffer.concat(responseBuffer);

      responseData = responseData.toString("utf8");

      resolve(JSON.parse(responseData));
    });
  });
};

const getContracts = async (chainId) => {
  const response = await get(
    `https://api.myso.finance/chainIds/${chainId}/contracts`,
    {
      responseType: "stream",
      decompress: false,
      transformResponse: (data) => {
        return data.pipe(zlib.createBrotliDecompress());
      },
    }
  );

  const data = await brotliDecode(response);

  return data.contracts;
};

const CoveredCallStrategiesAbi =
  "function strategies(uint256) view returns (address underlying, uint128 maxDeposits, uint128 minDeposits, uint128 startTime, uint128 tenor, uint128 minStrike, uint128 subscribeEndTime, uint256 totalDeposits, uint128 tokenRewardsPerDeposit)";

const whaleMatchTotalSubscriptionsAbi =
  "function totalSubscriptions(address) view returns (uint256)";

const getBlitzMatchBalances = async (api, contracts, fromBlock) => {
  const vaultFactory = contracts?.find(
    (contract) => contract.type === "vault_factory"
  )?.contractAddr;

  if (!vaultFactory);

  const logs = await getLogs({
    api,
    target: vaultFactory,
    eventAbi:
      "event NewVaultCreated(address indexed newLenderVaultAddr, address vaultOwner, uint256 numRegisteredVaults)",
    onlyArgs: true,
    fromBlock,
  });

  if (!logs.length) return;

  let ownerTokens = logs.map((i) => {
    return [
      contracts
        .filter((contract) => contract.type === "token")
        .map((contract) => contract.contractAddr),
      i.newLenderVaultAddr,
    ];
  });

  return sumTokens2({ api, ownerTokens });
};

const getCoveredCallOfTheWeekBalances = async (api, contracts) => {
  const coveredCallOfTheWeeks = contracts?.filter(
    (contract) => contract.type === "p2p"
  );

  if (!coveredCallOfTheWeeks) return;

  const coveredCallOfTheWeekStrategies = await api.multiCall({
    calls: coveredCallOfTheWeeks.map((contract) => ({
      target: contract?.contractAddr,
      params: [contract.poolData.strategyId],
    })),
    abi: CoveredCallStrategiesAbi,
  });

  if (!coveredCallOfTheWeekStrategies.length) return;

  coveredCallOfTheWeekStrategies.forEach((strategy) =>
    api.add(strategy.underlying, strategy.totalDeposits)
  );
};

const getWhaleMatchBalances = async (api, contracts, fromBlock) => {
  const fundingPoolFactory = contracts.find(
    (contract) => contract.type === "funding_pool_factory"
  )?.contractAddr;

  const fundingPools =
    contracts.filter((contract) => contract.type === "funding_pool") || [];

  if (!(fundingPoolFactory && fundingPools.length)) return;

  const logs = await getLogs({
    api,
    target: fundingPoolFactory,
    eventAbi:
      "event LoanProposalCreated(address indexed loanProposalAddr, address indexed fundingPool, address indexed sender, address collToken, uint256 arrangerFee, uint256 unsubscribeGracePeriod, uint256 numLoanProposals)",
    onlyArgs: true,
    fromBlock,
  });

  if (logs.length) {
    const loanProposalBalances = await api.multiCall({
      calls: logs.map((log) => ({
        target: log?.fundingPool,
        params: [log.loanProposalAddr],
      })),
      abi: whaleMatchTotalSubscriptionsAbi,
    });
    const tokens = await api.multiCall({
      abi: "address:depositToken",
      calls: logs.map((log) => log.fundingPool),
    });
    api.add(tokens, loanProposalBalances);
  }

  let tokensAndOwners = fundingPools.map((fundingPool) => {
    return [fundingPool.loanCcyToken, fundingPool.contractAddr];
  });

  return sumTokens2({ api, tokensAndOwners });
};

async function tvl(api) {
  const { fromBlock } = config[api.chain];

  let contracts;

  try {
    contracts = await getContracts(api.chainId);
    await setCache("myso-v2", api.chain, contracts);
  } catch (e) {
    contracts = await getCache("myso-v2", api.chain);
  }

  await getBlitzMatchBalances(api, contracts, fromBlock);
  await getCoveredCallOfTheWeekBalances(api, contracts);

  return getWhaleMatchBalances(api, contracts, fromBlock);
}

const config = {
  mantle: {
    fromBlock: 3471026,
  },
  ethereum: {
    fromBlock: 18213104,
  },
  arbitrum: {
    fromBlock: 143181867,
  },
  base: {
    fromBlock: 6239916,
  },
  evmos: {
    fromBlock: 18112793,
  },
  neon_evm: {
    fromBlock: 237206849,
  },
  telos: {
    fromBlock: 324711636,
  },
  linea: {
    fromBlock: 2118418,
  },
  sei: {
    fromBlock: 79773668,
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
