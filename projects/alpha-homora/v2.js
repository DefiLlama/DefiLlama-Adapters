const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const axios = require("axios");
const { request, gql } = require("graphql-request");
const { sumTokens, unwrapCreamTokens, unwrapUniswapLPs } = require('../helper/unwrapLPs')


const chainParams = {
    avax: {
        safeBoxApi: "https://homora-api.alphafinance.io/v2/43114/safeboxes",
        latestAlphaHomoraV2GraphUrl: `https://api.thegraph.com/subgraphs/name/alphafinancelab/alpha-homora-v2-avax`,
        poolsJsonUrl: "https://homora-api.alphafinance.io/v2/43114/pools",
        instances: [
            {
                wMasterChefAddress: "0xb41de9c1f50697cc3fd63f24ede2b40f6269cbcb",
                wLiquidityGauge: "0xf1f32c8eeb06046d3cc3157b8f9f72b09d84ee5b", // wrong
                poolsJsonUrl: "https://homora-api.alphafinance.io/v2/43114/pools",
                graphUrl: `https://api.thegraph.com/subgraphs/name/alphafinancelab/alpha-homora-v2-avax`,
            },
        ]
    },
    ethereum: {
        safeBoxApi: "https://homora-api.alphafinance.io/v2/1/safeboxes",
        coreOracleAddress: "0x6be987c6d72e25f02f6f061f94417d83a6aa13fc",
        latestAlphaHomoraV2GraphUrl: `https://api.thegraph.com/subgraphs/name/hermioneeth/alpha-homora-v2-mainnet`,
        instances: [
            {
                // Current
                werc20Address: "0x06799a1e4792001aa9114f0012b9650ca28059a3",
                wMasterChefAddress: "0xa2caea05ff7b98f10ad5ddc837f15905f33feb60",
                wLiquidityGauge: "0xf1f32c8eeb06046d3cc3157b8f9f72b09d84ee5b",
                wStakingRewardIndex: "0x011535fd795fd28c749363e080662d62fbb456a7",
                wStakingRewardPerp: "0xc4635854480fff80f742645da0310e9e59795c63",
                poolsJsonUrl: "https://homora-api.alphafinance.io/v2/1/pools",
                graphUrl: `https://api.thegraph.com/subgraphs/name/hermioneeth/alpha-homora-v2-relaunch`,
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
                graphUrl: `https://api.thegraph.com/subgraphs/name/hermioneeth/alpha-homora-v2-mainnet`,
            }
        ]
    }
}

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

module.exports = {
    tvlV2,
    tvlV2Onchain
}

async function getPools(poolsJsonUrl){
    return poolsJsonUrl === "local"? require('./v2/legacy-pools.json') : (await axios.get(poolsJsonUrl)).data
}

async function tvlV2Onchain(block, chain) {
    const balances = {}
    const transform = addr => `${chain}:${addr}`
    const { safeBoxApi, poolsJsonUrl } = chainParams[chain];
    const { data: safebox } = await axios.get(safeBoxApi);
    await unwrapCreamTokens(balances, safebox.map(s=>[s.cyTokenAddress, s.safeboxAddress]), block, chain, transform)
    const pools= await getPools(poolsJsonUrl);
    const { output: masterchefLpTokens } = await sdk.api.abi.multiCall({
        calls: pools.map((pool) => ({
            target: pool.exchange.stakingAddress,
            params: [pool.pid, pool.wTokenAddress],
        })).filter(c => c.target !== undefined),
        chain,
        abi: abi["userInfo"],
        block,
    });
    const lpPools = masterchefLpTokens.map((amount, i) => ({
        balance: amount.output.amount,
        token: pools[i].lpTokenAddress
    }))
    const { output: stakingPoolsLpTokens } = await sdk.api.abi.multiCall({
        calls: pools.map((pool) => ({
            target: pool.stakingAddress,
            params: [pool.wTokenAddress],
        })).filter(c => c.target !== undefined),
        chain,
        abi: "erc20:balanceOf",
        block,
    });
    stakingPoolsLpTokens.forEach((amount, i) => lpPools.push({
        balance: amount.output,
        token: pools[i].lpTokenAddress
    }))
    await unwrapUniswapLPs(balances, lpPools, block, chain, transform)
    return balances
}

async function tvlV2(block, chain) {
    const { safeBoxApi, coreOracleAddress, latestAlphaHomoraV2GraphUrl, instances } = chainParams[chain];
    const cyTokens = await getCyTokens(block, safeBoxApi, latestAlphaHomoraV2GraphUrl);
    const collateralGroups = await Promise.all(instances.map(params => getTotalCollateral(block, params)))

    const tokens = Array.from(
        new Set([
            ...collateralGroups.map(collaterals =>
                collaterals.map((collateral) => collateral.lpTokenAddress)
                    .filter((lpToken) => !!lpToken)).flat(),
            ...cyTokens.map((cy) => cy.token).filter((token) => !!token),
        ])
    );

    const tokenPrices = await getTokenPrices(tokens, block, chain, coreOracleAddress);

    const totalCollateralValue = BigNumber.sum(...collateralGroups.map(collaterals => sumCollaterals(collaterals, tokenPrices)))

    const totalCyValue = BigNumber.sum(
        0,
        ...cyTokens.map((cy) => {
            if (cy.token in tokenPrices) {
                return BigNumber(cy.amount).times(tokenPrices[cy.token]);
            }
            return BigNumber(0);
        })
    );

    return totalCollateralValue
        .plus(totalCyValue);
}

function sumCollaterals(collaterals, tokenPrices) {
    return BigNumber.sum(
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
}

async function getCyTokens(block, safeBoxApi, AlphaHomoraV2GraphUrl) {
    const { data: safebox } = await axios.get(
        safeBoxApi
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

async function getTokenPrices(tokens, block, chain, coreOracleAddress) {
    const { output: _ethPrices } = await sdk.api.abi.multiCall({
        calls: tokens.map((token) => ({
            target: coreOracleAddress,
            params: [token],
        })),
        chain,
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

async function getTotalCollateral(
    block,
    {
        werc20Address,
        wMasterChefAddress,
        wLiquidityGauge,
        wStakingRewardIndex,
        wStakingRewardPerp,
        poolsJsonUrl,
        graphUrl,
    }
) {
    const pools = await getPools(poolsJsonUrl);

    const {
        crvCollaterals,
        sushiswapCollaterals,
        werc20Collaterals,
        wstakingRewardCollaterals,
    } = await request(graphUrl, GET_TOTAL_COLLATERALS, {
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
