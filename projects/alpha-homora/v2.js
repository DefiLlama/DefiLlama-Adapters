const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { request, } = require("graphql-request");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')


const chainParams = {
  optimism: {
    safeBoxApi: "https://api.homora.alphaventuredao.io/v2/10/safeboxes",
    latestAlphaHomoraV2GraphUrl: sdk.graph.modifyEndpoint('B3g98fbbStVKtff6QUY6iMUqp7rxqrdDyGdrXAmcWG6B'),
    poolsJsonUrl: "https://api.homora.alphaventuredao.io/v2/10/pools",
    instances: []
  },
  avax: {
    safeBoxApi: "https://homora-api.alphafinance.io/v2/43114/safeboxes",
    latestAlphaHomoraV2GraphUrl: sdk.graph.modifyEndpoint('8zVTsZBmd8CU7vnmonPr7qex4A69yM7NSzxKCpGHw6Q6'),
    poolsJsonUrl: "https://homora-api.alphafinance.io/v2/43114/pools",
    instances: [
      {
        wMasterChefAddress: "0xb41de9c1f50697cc3fd63f24ede2b40f6269cbcb",
        wLiquidityGauge: "0xf1f32c8eeb06046d3cc3157b8f9f72b09d84ee5b", // wrong
        poolsJsonUrl: "https://homora-api.alphafinance.io/v2/43114/pools",
        graphUrl: sdk.graph.modifyEndpoint('8zVTsZBmd8CU7vnmonPr7qex4A69yM7NSzxKCpGHw6Q6'),
      },
    ]
  },
  fantom: {
    safeBoxApi: "https://homora-api.alphafinance.io/v2/250/safeboxes",
    latestAlphaHomoraV2GraphUrl: sdk.graph.modifyEndpoint('H4Q15YbQxRWw14HaABfWiTptSwRzanXNwyACY8MCRqVS'),
    poolsJsonUrl: "https://homora-api.alphafinance.io/v2/250/pools",
    instances: [
      {
        wMasterChefAddress: "0x5FC20fCD1B50c5e1196ac790DADCfcDD416bb0C7",
        wLiquidityGauge: "0xf1f32c8eeb06046d3cc3157b8f9f72b09d84ee5b", // wrong
        poolsJsonUrl: "https://homora-api.alphafinance.io/v2/43114/pools",
        graphUrl: sdk.graph.modifyEndpoint('H4Q15YbQxRWw14HaABfWiTptSwRzanXNwyACY8MCRqVS'),
      },
    ]
  },
  ethereum: {
    safeBoxApi: "https://homora-api.alphafinance.io/v2/1/safeboxes",
    coreOracleAddress: "0x6be987c6d72e25f02f6f061f94417d83a6aa13fc",
    latestAlphaHomoraV2GraphUrl: sdk.graph.modifyEndpoint('CnfAARjTUna6ZVo7RjJvQmm44e7uWx6kbaRm4Xh5MR5N'),
    instances: [
      {
        // Current
        werc20Address: "0x06799a1e4792001aa9114f0012b9650ca28059a3",
        wMasterChefAddress: "0xa2caea05ff7b98f10ad5ddc837f15905f33feb60",
        wLiquidityGauge: "0xf1f32c8eeb06046d3cc3157b8f9f72b09d84ee5b",
        wStakingRewardIndex: "0x011535fd795fd28c749363e080662d62fbb456a7",
        wStakingRewardPerp: "0xc4635854480fff80f742645da0310e9e59795c63",
        poolsJsonUrl: "https://homora-api.alphafinance.io/v2/1/pools",
        graphUrl: sdk.graph.modifyEndpoint('37CbUUxwQC7uTqQquQXtQQF8b2bU7L3VBrkEntiHxf4r'),
      },
      {
        // Legacy
        werc20Address: "0xe28d9df7718b0b5ba69e01073fe82254a9ed2f98",
        wMasterChefAddress: "0x373ae78a14577682591e088f2e78ef1417612c68",
        wLiquidityGauge: "0xfdb4f97953150e47c8606758c13e70b5a789a7ec",
        wStakingRewardIndex: "0x713df2ddda9c7d7bda98a9f8fcd82c06c50fbd90",
        wStakingRewardPerp: "0xc4635854480fff80f742645da0310e9e59795c63",
        poolsJsonUrl:
          "local",
        graphUrl: sdk.graph.modifyEndpoint('CnfAARjTUna6ZVo7RjJvQmm44e7uWx6kbaRm4Xh5MR5N'),
      }
    ]
  }
}

const GET_TOTAL_COLLATERALS = `
  query GET_TOTAL_COLLATERALS{
    werc20Collaterals {
      lpToken
      amount
    }
    sushiswapCollaterals{
      pid
      amount
    }
    crvCollaterals {
      pid
      gid
      amount
    }
    wstakingRewardCollaterals {
      wtoken
      amount
    }
  }
`;

module.exports = {
  tvlV2,
  tvlV2Onchain
}

async function getPools(poolsJsonUrl, chain) {
  return poolsJsonUrl === "local" ? require('./v2/legacy-pools.json') : (await getConfig('alpha-hormora/v2-pools/' + chain, poolsJsonUrl))
}

async function tvlV2Onchain(api) {
  const chain = api.chain
  const { safeBoxApi, poolsJsonUrl, } = chainParams[chain];
  let safebox = await getConfig('alpha-hormora/v2-safebox/' + chain, safeBoxApi);
  const ownerTokens = safebox.map(s => [[s.cyTokenAddress], s.safeboxAddress])
  await sumTokens2({ api, ownerTokens })
  let pools = await getPools(poolsJsonUrl, chain);
  const owners = pools.filter(i => i.wTokenType === 'WUniswapV3').map(i => i.wTokenAddress).filter(i => i)
  pools = pools.filter(i => i.wTokenType !== 'WUniswapV3')
  let poolsWithPid = pools.filter(p => p.pid !== undefined)
  let poolsWithoutPid = pools.filter(p => p.pid === undefined)
  const masterchefLpTokens = await api.multiCall({
    calls: poolsWithPid.map((pool) => ({
      target: pool.exchange.stakingAddress ?? pool.stakingAddress,
      params: [pool.pid, pool.wTokenAddress],
    })),
    abi: abi["userInfo"],
  });
  masterchefLpTokens.map((amount, i) => api.add(poolsWithPid[i].lpTokenAddress, amount.amount))
  const stakingPoolsLpTokens = await api.multiCall({
    calls: poolsWithoutPid.map((pool) => ({ target: pool.stakingAddress, params: [pool.wTokenAddress], })),
    abi: "erc20:balanceOf",
  });
  stakingPoolsLpTokens.forEach((amount, i) => api.add(poolsWithoutPid[i].lpTokenAddress, amount))
  const blacklisted = ['0xf3a602d30dcb723a74a0198313a7551feaca7dac', '0x2a8a315e82f85d1f0658c5d66a452bbdd9356783', '0x75E5509029c85fE08e4934B1275c5575aA5538bE']
  blacklisted.forEach(i => api.removeTokenBalance(i))
  await sumTokens2({ api, owners, resolveUniV3: api.chain === 'optimism',  resolveLP: api.chain !== 'optimism', })
}

async function tvlV2(api) {
  const chain = api.chain
  const { safeBoxApi, instances } = chainParams[chain];
  await getCyTokens(api, safeBoxApi);
  await Promise.all(instances.map(params => getTotalCollateral(params, api)))
}

async function getCyTokens(api, safeBoxApi) {
  const safebox = await getConfig('alpha-hormora/v2-safebox/' + api.chain, safeBoxApi);
  const ownerTokens = safebox.map(s => [[s.cyTokenAddress, s.address], s.safeboxAddress])
  return api.sumTokens({ ownerTokens, })
}


async function getTotalCollateral({ wMasterChefAddress, wLiquidityGauge, poolsJsonUrl, graphUrl, }, api) {
  const chain = api.chain
  const pools = await getPools(poolsJsonUrl, chain);

  const { crvCollaterals, sushiswapCollaterals, werc20Collaterals, wstakingRewardCollaterals, } = await request(graphUrl, GET_TOTAL_COLLATERALS, { block: undefined });

  crvCollaterals.map((coll) => {
    const pool = pools.find((pool) => pool.wTokenAddress === wLiquidityGauge && Number(coll.pid) === pool.pid && Number(coll.gid) === pool.gid);
    if (!pool || !pool.lpTokenAddress)
      return;
    api.add(pool.lpTokenAddress, coll.amount);
  })

  sushiswapCollaterals.map((coll) => {
    const pool = pools.find((pool) => pool.wTokenAddress === wMasterChefAddress && Number(coll.pid) === pool.pid);
    if (!pool || !pool.lpTokenAddress)
      return;
    api.add(pool.lpTokenAddress, coll.amount);
  })

  werc20Collaterals.map((coll) => api.add("0x" + BigNumber(coll.lpToken).toString(16).padStart(40, "0").toLowerCase(), coll.amount))

  wstakingRewardCollaterals.map((coll) => {
    const pool = pools.find((pool) => pool.wTokenAddress === coll.wtoken);
    if (!pool || !pool.lpTokenAddress)
      return;
    api.add(pool.lpTokenAddress, coll.amount);
  })
}
