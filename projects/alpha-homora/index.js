/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const axios = require("axios");
const { request, gql } = require("graphql-request");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs")

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  const ethAddress = "0x0000000000000000000000000000000000000000";
  let balances = {
    [ethAddress]: "0", // ETH
  };

  const tvls = await Promise.all([
    tvlV1(timestamp, block),
    tvlV2(timestamp, block),
    tvlBSC(timestamp)
  ]);

  const ethTvl = BigNumber.sum(tvls[0], tvls[1]);
  balances[ethAddress] = ethTvl.toFixed(0);
  Object.assign(balances, tvls[2]) // bsc addresses are prefixed with 'bsc', so it's impossible to get collisions

  return balances;
}

async function tvlV1(timestamp, block) {
  const startTimestamp = 1602054167;
  const startBlock = 11007158;

  if (timestamp < startTimestamp || block < startBlock) {
    return BigNumber(0);
  }

  const { data } = await axios.get(
    "https://homora.alphafinance.io/static/contracts.json"
  );

  const bankAddress = data.bankAddress.toLowerCase();
  const WETHAddress = data.WETHAddress.toLowerCase();

  let pools = data.pools;

  const uniswapPools = pools.filter(
    (pool) => pool.exchange === "Uniswap" || pool.exchange === "IndexCoop"
  );

  const sushiswapPools = pools.filter(
    (pool) => pool.exchange === "Sushi" || pool.exchange === "Pickle"
  );
  pools = [...uniswapPools, ...sushiswapPools];

  const { output: _totalETH } = await sdk.api.abi.call({
    target: bankAddress,
    block,
    abi: abi["totalETH"],
  });

  const totalETH = BigNumber(_totalETH);

  const { output: _totalDebt } = await sdk.api.abi.call({
    target: bankAddress,
    block,
    abi: abi["glbDebtVal"],
  });

  const totalDebt = BigNumber(_totalDebt);

  // Uniswap Pools
  const { output: _UnilpTokens } = await sdk.api.abi.multiCall({
    calls: uniswapPools.map((pool) => ({
      target: pool.lpStakingAddress,
      params: [pool.goblinAddress],
    })),
    abi: abi["balanceOf"],
    block,
  });

  // Sushiswap Pools
  const { output: _SushilpTokens } = await sdk.api.abi.multiCall({
    calls: sushiswapPools.map((pool) => ({
      target: pool.lpStakingAddress,
      params: [pool.id, pool.goblinAddress],
    })),
    abi: abi["userInfo"],
    block,
  });

  const _lpTokens = [
    ..._UnilpTokens,
    ..._SushilpTokens.map((x) => ({
      output: x.output[0],
    })),
  ];

  const lpTokens = _lpTokens.map((_lpToken) => BigNumber(_lpToken.output || 0));

  const { output: _totalETHOnStakings } = await sdk.api.abi.multiCall({
    calls: pools.map((pool) => ({
      target: WETHAddress,
      params: [pool.lpTokenAddress],
    })),
    abi: abi["balanceOf"],
    block,
  });

  const totalETHOnStakings = _totalETHOnStakings.map((stake) =>
    BigNumber(stake.output || 0)
  );

  const { output: _totalLpTokens } = await sdk.api.abi.multiCall({
    calls: pools.map((pool) => ({
      target: pool.lpTokenAddress,
    })),
    abi: abi["totalSupply"],
    block,
  });

  const totalLpTokens = _totalLpTokens.map((_totalLpToken) =>
    BigNumber(_totalLpToken.output || 0)
  );

  const unUtilizedValue = totalETH.minus(totalDebt);

  let tvl = BigNumber(unUtilizedValue);
  for (let i = 0; i < lpTokens.length; i++) {
    if (totalLpTokens[i].gt(0)) {
      const amount = lpTokens[i]
        .times(totalETHOnStakings[i])
        .div(totalLpTokens[i])
        .times(BigNumber(2));

      tvl = tvl.plus(amount);
    }
  }
  return tvl;
}

const coreOracleAddress = "0x1e5bddd0cdf8839d6b27b34927869ef0ad7bf692";
const werc20Address = "0xe28d9df7718b0b5ba69e01073fe82254a9ed2f98";
const wMasterChefAddress = "0x373ae78a14577682591e088f2e78ef1417612c68";
const wLiquidityGauge = "0xfdb4f97953150e47c8606758c13e70b5a789a7ec";
const wStakingRewardIndex = "0x713df2ddda9c7d7bda98a9f8fcd82c06c50fbd90";
const wStakingRewardPerp = "0xc4635854480fff80f742645da0310e9e59795c63";
const AlphaHomoraV2GraphUrl = `https://api.thegraph.com/subgraphs/name/hermioneeth/alpha-homora-v2-mainnet`;
const GET_TOTAL_COLLATERALS = gql`
  query GET_TOTAL_COLLATERALS($block: Int) {
    werc20Collaterals(block: { number: $block }) {
      lpToken
      amount
    }
    sushiswapCollaterals(block: { number: $block }) {
      pid
      amount
    }
    crvCollaterals(block: { number: $block }) {
      pid
      gid
      amount
    }
    wstakingRewardCollaterals(block: { number: $block }) {
      wtoken
      amount
    }
  }
`;
const GET_CY_TOKEN = gql`
  query GET_CY_TOKEN($cyToken: String, $block: Int) {
    cyTokenStates(
      where: { cyToken: $cyToken }
      first: 1
      orderBy: blockTimestamp
      orderDirection: desc
      block: { number: $block }
    ) {
      id
      cyToken
      safeboxBalance
      exchangeRate
      blockTimestamp
    }
  }
`;

async function tvlV2(timestamp, block) {
  const [collaterals, cyTokens] = await Promise.all([
    getTotalCollateral(block),
    getCyTokens(block),
  ]);

  const tokens = Array.from(
    new Set([
      ...collaterals
        .map((collateral) => collateral.lpTokenAddress)
        .filter((lpToken) => !!lpToken),
      ...cyTokens.map((cy) => cy.token).filter((token) => !!token),
    ])
  );

  const tokenPrices = await getTokenPrices(tokens, block);

  const totalCollateralValue = BigNumber.sum(
    0, // Default value
    ...collaterals.map((collateral) => {
      if (collateral.lpTokenAddress in tokenPrices) {
        return BigNumber(collateral.amount).times(
          tokenPrices[collateral.lpTokenAddress]
        );
      }
      return BigNumber(0);
    })
  );

  const totalCyValue = BigNumber.sum(
    0,
    ...cyTokens.map((cy) => {
      if (cy.token in tokenPrices) {
        return BigNumber(cy.amount).times(tokenPrices[cy.token]);
      }
      return BigNumber(0);
    })
  );

  return totalCollateralValue.plus(totalCyValue);
}

async function getCyTokens(block) {
  const { data: safebox } = await axios.get(
    "https://homora-v2.alphafinance.io/static/safebox.json"
  );
  return Promise.all(
    safebox.map(async (sb) => {
      const cyToken = sb.cyTokenAddress;
      const { cyTokenStates } = await request(
        AlphaHomoraV2GraphUrl,
        GET_CY_TOKEN,
        {
          block,
          cyToken,
        }
      );
      const cyTokenState = cyTokenStates[0];
      if (!cyTokenState) {
        return { amount: new BigNumber(0), token: null };
      }
      const exchangeRate = new BigNumber(cyTokenState.exchangeRate).div(1e18);
      const cyBalance = new BigNumber(cyTokenState.safeboxBalance);
      return { amount: cyBalance.times(exchangeRate), token: sb.address };
    })
  );
}

async function getTokenPrices(tokens, block) {
  const { output: _ethPrices } = await sdk.api.abi.multiCall({
    calls: tokens.map((token) => ({
      target: coreOracleAddress,
      params: [token],
    })),
    abi: abi["getETHPx"],
    block,
  });

  const tokenPrices = {};
  for (let i = 0; i < _ethPrices.length; i++) {
    const price = BigNumber(_ethPrices[i].output).div(BigNumber(2).pow(112));
    if (price.gte(0)) {
      tokenPrices[tokens[i]] = price;
    }
  }
  return tokenPrices;
}

async function getTotalCollateral(block) {
  const { data: pools } = await axios.get(
    "https://homora-v2.alphafinance.io/static/pools.json"
  );

  const {
    crvCollaterals,
    sushiswapCollaterals,
    werc20Collaterals,
    wstakingRewardCollaterals,
  } = await request(AlphaHomoraV2GraphUrl, GET_TOTAL_COLLATERALS, {
    block,
  });

  const collaterals = [
    ...crvCollaterals.map((coll) => {
      const pool = pools.find(
        (pool) =>
          pool.wTokenAddress === wLiquidityGauge &&
          Number(coll.pid) === pool.pid &&
          Number(coll.gid) === pool.gid
      );
      if (!pool) {
        return {
          lpTokenAddress: null,
          amount: BigNumber(0),
        };
      }
      return {
        lpTokenAddress: pool.lpTokenAddress ? pool.lpTokenAddress : null,
        amount: BigNumber(coll.amount),
      };
    }),
    ...sushiswapCollaterals.map((coll) => {
      const pool = pools.find(
        (pool) =>
          pool.wTokenAddress === wMasterChefAddress &&
          Number(coll.pid) === pool.pid
      );
      if (!pool) {
        return {
          lpTokenAddress: null,
          amount: BigNumber(0),
        };
      }
      return {
        lpTokenAddress: pool.lpTokenAddress ? pool.lpTokenAddress : null,
        amount: BigNumber(coll.amount),
      };
    }),
    ...werc20Collaterals.map((coll) => ({
      lpTokenAddress:
        "0x" +
        BigNumber(coll.lpToken).toString(16).padStart(40, "0").toLowerCase(),
      amount: BigNumber(coll.amount),
    })),
    ...wstakingRewardCollaterals.map((coll) => {
      const pool = pools.find((pool) => pool.wTokenAddress === coll.wtoken);
      if (!pool) {
        return {
          lpTokenAddress: null,
          amount: BigNumber(0),
        };
      }
      return {
        lpTokenAddress: pool.lpTokenAddress ? pool.lpTokenAddress : null,
        amount: BigNumber(coll.amount),
      };
    }),
  ];

  return collaterals;
}

const GET_GOBLIN_SUMMARIES = gql`
  query GET_GOBLIN_SUMMARIES($block: Int) {
    goblinSummaries(block: { number: $block }) {
      id
      totalLPToken
    }
  }
`;
const wBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

function getBSCAddress(address) {
  return `bsc:${address}`
}

async function tvlBSC(timestamp) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: 'bsc'
  })
  const balances = {}
  const {
    goblinSummaries
  } = await request('https://api.thegraph.com/subgraphs/name/hermioneeth/alpha-homora-bank-bsc', GET_GOBLIN_SUMMARIES, {
    block,
  });
  const lpTokens = (await sdk.api.abi.multiCall({
    block,
    abi: { "constant": true, "inputs": [], "name": "lpToken", "outputs": [{ "internalType": "contract IUniswapV2Pair", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" },
    calls: goblinSummaries.map(goblin => ({
      target: goblin.id
    })),
    chain: 'bsc'
  })).output
  await unwrapUniswapLPs(balances, goblinSummaries.map(goblin => {
    const lpToken = lpTokens.find(call => call.input.target === goblin.id).output;
    return {
      token: lpToken,
      balance: goblin.totalLPToken
    }
  }),
    block,
    'bsc',
    (addr) => `bsc:${addr}`)
  const unusedBNB = await sdk.api.eth.getBalance({
    target: '0x3bB5f6285c312fc7E1877244103036ebBEda193d',
    block,
    chain: 'bsc'
  })
  balances[getBSCAddress(wBNB)] = BigNumber(balances[getBSCAddress(wBNB)] || 0).plus(BigNumber(unusedBNB.output)).toFixed(0)
  return balances
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: "Alpha Homora", // project name
  token: "ALPHA", // null, or token symbol if project has a custom token
  category: "lending", // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
  start: 1602054167, // unix timestamp (utc 0) specifying when the project began, or where live data begins
  tvl, // tvl adapter
};
