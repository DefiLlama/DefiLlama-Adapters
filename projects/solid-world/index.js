const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require("../helper/cache/getLogs");
const BigNumber = require("bignumber.js");
const SECONDS_IN_WEEK = 604800;
const DAYS_IN_YEAR = 365;

function computeTimeAppreciationDiscount(
  timeAppreciation,
  certificationDate
) {
  const yearsTillCertification = yearsBetween(certificationDate);
  if (yearsTillCertification === 0) {
    return 1;
  }

  // adjusting for 6 decimals
  const timeAppreciationPercentage = Number(timeAppreciation) / 1_000_000;
  return Math.pow(1 - timeAppreciationPercentage, yearsTillCertification);
}

function yearsBetween(
  endDate,
  startDate = new Date().getTime()
) {
  endDate = Number(endDate);

  if (endDate <= startDate) {
    return 0;
  }

  const diff = endDate - startDate;
  return toYears(Math.floor(diff / 1000));
}

function toYears(seconds) {
  const weeks = Math.floor(seconds / SECONDS_IN_WEEK);
  if (weeks === 0) {
    return 0;
  }

  const days = weeks * 7;

  return days / DAYS_IN_YEAR;
}


// creditsAmount * 10e18 * (1 - timeAppreciation) ** yearsTillCertification
function computeValuation({ creditsAmount, timeAppreciation, certificationDate }) {
  const timeAppreciationDiscount = computeTimeAppreciationDiscount(
    timeAppreciation,
    certificationDate
  );

  return BigNumber(creditsAmount)
    .times(BigNumber(10).pow(18))
    .times(timeAppreciationDiscount)
    .toFixed(0);
}
const config = {
  polygon: {
    SolidWorldManager: "0xe967aEBdbf137C2ddD4aaF076E87177c4EBEB851",
    ForwardContractBatchToken: "0x029090aC92b0BAAF20Ccef615BAfD268f08Db8fA",
    pools: [
      {
        crispToken: "0xEF6Ab48ef8dFe984FAB0d5c4cD6AFF2E54dfdA14",
        hypervisor: "0x4a39cBb8198376AB08c24e596fF5E668c3ca269E",
        stakingContract: "0xaD7Ce5Cf8E594e1EFC6922Ab2c9F81d7a0E14337"
      },
      {
        crispToken: "0x672688C6Ee3E750dfaA4874743Ef693A6f2538ED",
        hypervisor: "0x27420e641CE96a6C0191dbFA0A9500eaCe33531d",
        stakingContract: "0xaD7Ce5Cf8E594e1EFC6922Ab2c9F81d7a0E14337"
      }
    ]
  }
};
const abi = {
    "getTotalAmounts": "function getTotalAmounts() external view returns (uint256 total0, uint256 total1)",
    "getBatchCategory": "function getBatchCategory(uint256 batchId) external view returns (uint256 categoryId)",
    "getBatch": "function getBatch(uint256 batchId) external view returns (uint256 id, uint256 projectId, uint256 collateralizedCredits, address supplier, uint32 certificationDate, uint16 vintage, uint8 status, uint24 batchTA, bool isAccumulating)",
    "getCategory": "function getCategory(uint256 categoryId) external view returns (uint256 volumeCoefficient, uint40 decayPerSecond, uint16 maxDepreciation, uint24 averageTA, uint32 lastCollateralizationTimestamp, uint256 totalCollateralized, uint256 lastCollateralizationMomentum)",
    "getCategoryToken": "function getCategoryToken(uint256 categoryId) external view returns (address token)",
    "totalSupply": "uint256:totalSupply",
    "balanceOf": "erc20:balanceOf",
    "token0": "address:token0",
    "token1": "address:token1"
  };

// inlined from forward-contract-batch-supply.js
const nullTopic = '0x0000000000000000000000000000000000000000000000000000000000000000'
const fcbtAbis = {
  transferSingle: "event TransferSingle (address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  transferBatch: "event TransferBatch (address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
}

async function fetchForwardContractBatchSupplies(api) {
  const mintLogs = await getLogs({
    api,
    onlyArgs: true,
    fromBlock: 42782566,
    topics: ['0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, nullTopic],
    eventAbi: fcbtAbis.transferSingle,
    extraKey: 'mint-transfer-single',
    target: config[api.chain].ForwardContractBatchToken
  });
  const burnLogs = await getLogs({
    api,
    onlyArgs: true,
    fromBlock: 42782566,
    topics: ['0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', null, null, nullTopic],
    eventAbi: fcbtAbis.transferSingle,
    extraKey: 'burn-transfer-single',
    target: config[api.chain].ForwardContractBatchToken
  });
  const transferBatchBurnLogs = await getLogs({
    api,
    onlyArgs: true,
    fromBlock: 42782566,
    topics: ["0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb", null, null, nullTopic],
    eventAbi: fcbtAbis.transferBatch,
    extraKey: 'burn-transfer-batch',
    target: config[api.chain].ForwardContractBatchToken
  });

  const supply = {};

  mintLogs
    .forEach(mint => {
      const batchId = mint.id.toString();
      supply[batchId] = (supply[batchId] || BigNumber(0)).plus(mint.value.toString());
    });
  burnLogs
    .map(burn => {
      const batchId = burn.id.toString();
      if (!supply[batchId]) {
        throw new Error(`Burned batch ${batchId} without minting it first.`);
      }

      supply[batchId] = supply[batchId].minus(burn.value.toString());

      if (supply[batchId].isNegative()) {
        throw new Error(`Burned more than minted for batch ${batchId}`);
      }
    });

  transferBatchBurnLogs
    .forEach(batchBurn => batchBurn.ids.forEach((burnId, i) => {
      const batchId = burnId.toString();
      if (!supply[batchId]) {
        throw new Error(`Burned batch ${batchId} without minting it first.`);
      }

      supply[batchId] = supply[batchId].minus(batchBurn.values[i].toString());

      if (supply[batchId].isNegative()) {
        throw new Error(`Burned more than minted for batch ${batchId}`);
      }
    }));

  return supply;
}

// inlined from categories-and-batches.js
async function fetchCategoriesAndBatches(api, batchIds) {
  const allCategoryIds = new Set();
  const allBatches = [];

  for (let i = 0; i < batchIds.length; i += 10) {
    const ids = batchIds.slice(i, i + 10);
    const [categoryIds, batches] = await fetchCategoryIdsAndBatches(api, ids);
    categoryIds.forEach(id => allCategoryIds.add(id.toString()));
    allBatches.push(...batches);
  }

  const categories = await fetchCategories(api, Array.from(allCategoryIds));

  return [categories, allBatches];
}

async function fetchCategoryIdsAndBatches(api, forwardContractBatchIds) {
  const [categoryIds, batches] = await Promise.all([
    api.multiCall({
      calls: forwardContractBatchIds.map(id => ({
        target: config[api.chain].SolidWorldManager,
        params: [id]
      })),
      abi: abi.getBatchCategory
    }),
    api.multiCall({
      calls: forwardContractBatchIds.map(id => ({
        target: config[api.chain].SolidWorldManager,
        params: [id]
      })),
      abi: abi.getBatch
    })
  ]);

  batches.forEach((batch, i) => {
    batch.categoryId = categoryIds[i].toString();
  });

  return [categoryIds, batches];
}

async function fetchCategories(api, categoryIds) {
  const [categories, categoryTokens] = await Promise.all([
    api.multiCall({
      calls: categoryIds.map(id => ({
        target: config[api.chain].SolidWorldManager,
        params: [id]
      })),
      abi: abi.getCategory
    }),
    api.multiCall({
      calls: categoryIds.map(id => ({
        target: config[api.chain].SolidWorldManager,
        params: [id]
      })),
      abi: abi.getCategoryToken
    })
  ]
  );

  const result = {};
  categoryIds.forEach((id, i) => {
    const category = categories[i];
    category.token = categoryTokens[i];
    result[id] = category;
  });

  return result;
}

// inlined from batch-valuation.js
async function valuateBatches(batches, categories, batchesSupply) {
  const batchValuationDetails = batches.flatMap((batch) => {
    const category = categories[batch.categoryId];
    const supply = batchesSupply[batch.id.toString()];
    return [
      {
        creditsAmount: batch.collateralizedCredits.toString(),
        timeAppreciation: batch.batchTA.toString(),
        certificationDate: batch.certificationDate.toString() + "000",
        crispToken: category.token
      },
      {
        creditsAmount: supply.minus(batch.collateralizedCredits.toString()).toString(),
        timeAppreciation: category.averageTA.toString(),
        certificationDate: batch.certificationDate.toString() + "000",
        crispToken: category.token
      }
    ];
  });

  return batchValuationDetails.map(({ crispToken, ...details }) => ({
    crispToken,
    amount: computeValuation(details)
  }));
}

// the value of the current on-chain forward credits, based on their exchange rate to CRISP tokens
async function tvl(api) {
  const batchSupplies = await fetchForwardContractBatchSupplies(api);
  const [categories, batches] = await fetchCategoriesAndBatches(api, Object.keys(batchSupplies));
  const batchesValuation = await valuateBatches(batches, categories, batchSupplies);

  batchesValuation.forEach(({ crispToken, amount }) => {
    api.add(crispToken, amount)
  });
}

async function pool2(api) {
  const chainConfig = config[api.chain];
  const [token0s, token1s, totalAmounts, totalSupplies, stakedAmounts] = await Promise.all([
    api.multiCall({ calls: chainConfig.pools.map(pool => pool.hypervisor), abi: abi.token0 }),
    api.multiCall({ calls: chainConfig.pools.map(pool => pool.hypervisor), abi: abi.token1 }),
    api.multiCall({ calls: chainConfig.pools.map(pool => pool.hypervisor), abi: abi.getTotalAmounts }),
    api.multiCall({ calls: chainConfig.pools.map(pool => pool.hypervisor), abi: abi.totalSupply }),
    api.multiCall({
      calls: chainConfig.pools.map(pool => ({
        target: pool.hypervisor,
        params: [pool.stakingContract]
      })), abi: abi.balanceOf
    })
  ]);

  // zip the results
  const poolStats = chainConfig.pools.map((_, i) => ({
    token0: token0s[i],
    token1: token1s[i],
    totalAmount: totalAmounts[i],
    totalSupply: totalSupplies[i],
    stakedAmount: stakedAmounts[i]
  }));

  poolStats.forEach((e) => {
    const ratio = e.stakedAmount /e.totalSupply
    api.add(e.token0, e.totalAmount.total0 *ratio)
    api.add(e.token1, e.totalAmount.total1 *ratio)
  });
}

module.exports = {
  start: '2023-05-19', // Fri May 19 2023 06:30:00 GMT+0000
  methodology: `TVL is a measure of the health of the Solid World ecosystem. The TVL can be looked at from 2 perspectives. The 1st perspective, "RWA" valuation, represents the total value of the tokenized forward carbon credits, and is computed as the present value of the on-chain forward credits (ERC1155), based on their exchange rate to CRISP tokens (ERC20) and subsequent USDC value, summed-up.The 2nd perspective, "pool2", represents the total value locked up in our staking contract, and it's calculated by adding up the value of all the LP tokens that are staked. The LP tokens represent the amount of liquidity that has been provided to the Solid World platform.`,
  polygon: {
    tvl,
    pool2
  }
};
