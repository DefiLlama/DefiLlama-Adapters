const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");
const { unwrapCreamTokens, unwrapUniswapLPs, sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')


const chainParams = {
    optimism: {
        safeBoxApi: "https://api.homora.alphaventuredao.io/v2/10/safeboxes",
        latestAlphaHomoraV2GraphUrl: `https://api.thegraph.com/subgraphs/name/mintcnn/optimism`,
        poolsJsonUrl: "https://api.homora.alphaventuredao.io/v2/10/pools",
        instances: [ ]
    },
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
    fantom: {
        safeBoxApi: "https://homora-api.alphafinance.io/v2/250/safeboxes",
        latestAlphaHomoraV2GraphUrl: `https://api.thegraph.com/subgraphs/name/alphafinancelab/alpha-homora-v2-fantom`,
        poolsJsonUrl: "https://homora-api.alphafinance.io/v2/250/pools",        
        instances: [
            {
                wMasterChefAddress: "0x5FC20fCD1B50c5e1196ac790DADCfcDD416bb0C7",
                wLiquidityGauge: "0xf1f32c8eeb06046d3cc3157b8f9f72b09d84ee5b", // wrong
                poolsJsonUrl: "https://homora-api.alphafinance.io/v2/43114/pools",
                graphUrl: `https://api.thegraph.com/subgraphs/name/alphafinancelab/alpha-homora-v2-fantom`,
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

async function getPools(poolsJsonUrl, chain){
    return poolsJsonUrl === "local"? require('./v2/legacy-pools.json') : (await getConfig('alpha-hormora/v2-pools/'+chain, poolsJsonUrl))
}

async function tvlV2Onchain(block, chain) {
    const balances = {}
    const transform = addr => {
        if (addr.toLowerCase() === '0x260bbf5698121eb85e7a74f2e45e16ce762ebe11') 
          return 'avax:' + ADDRESSES.avax.USDT_e // Axelar wrapped UST -> USDT
        if (addr.toLowerCase() === '0x2147efff675e4a4ee1c2f918d181cdbd7a8e208f') 
        return '0xa1faa113cbe53436df28ff0aee54275c13b40975' // Wrapped Alpha Finance -> ALPHA (erc20)
      return  `${chain}:${addr}`
    }
    const { safeBoxApi, poolsJsonUrl, instances, } = chainParams[chain];
    let safebox = await getConfig('alpha-hormora/v2-safebox/'+chain, safeBoxApi);
    const safeBoxRewards = safebox.filter(i => i.ibStakingReward)
    safebox = safebox.filter(i => !i.ibStakingReward)
    await unwrapIBRewards({ boxes: safeBoxRewards, balances, chain, block, transform, })
    await unwrapCreamTokens(balances, safebox.map(s=>[s.cyTokenAddress, s.safeboxAddress]), block, chain, transform)
    let pools= await getPools(poolsJsonUrl, chain);
    const owners = pools.filter(i => i.wTokenType === 'WUniswapV3').map(i => i.wTokenAddress).filter(i => i)
    pools = pools.filter(i => i.wTokenType !== 'WUniswapV3')
    let poolsWithPid = pools.filter(p => p.pid !== undefined)
    let poolsWithoutPid = pools.filter(p => p.pid === undefined)
    const { output: masterchefLpTokens } = await sdk.api.abi.multiCall({
        calls: poolsWithPid.map((pool) => ({
            target: pool.exchange.stakingAddress ?? pool.stakingAddress,
            params: [pool.pid, pool.wTokenAddress],
        })),
        chain,
        abi: abi["userInfo"],
        block,
    });
    let lpPools = masterchefLpTokens.map((amount, i) => ({
        balance: amount.output.amount,
        token: poolsWithPid[i].lpTokenAddress
    }))
    const { output: stakingPoolsLpTokens } = await sdk.api.abi.multiCall({
        calls: poolsWithoutPid.map((pool) => ({
            target: pool.stakingAddress,
            params: [pool.wTokenAddress],
        })),
        chain,
        abi: "erc20:balanceOf",
        block,
    });
    stakingPoolsLpTokens.forEach((amount, i) => lpPools.push({
        balance: amount.output,
        token: poolsWithoutPid[i].lpTokenAddress
    }))
    const blacklisted = ['0xf3a602d30dcb723a74a0198313a7551feaca7dac', '0x2a8a315e82f85d1f0658c5d66a452bbdd9356783',].map(i => i.toLowerCase())
    lpPools = lpPools.filter(p => !blacklisted.includes(p.token.toLowerCase()))
    await unwrapUniswapLPs(balances, lpPools, block, chain, transform)
    if (owners.length) await sumTokens2({ balances, chain, block, owners, resolveUniV3: true, })

    return balances
}

async function unwrapIBRewards({ block, chain, boxes, balances, transform}) {
    for (const { cyTokenAddress, ibStakingReward, safeboxAddress, } of boxes) {
        const tempBalance = {}
        const [
            { output: balanceOf,},
            { output: totalSupply,},
        ] = await Promise.all([
            sdk.api.erc20.balanceOf({ target: ibStakingReward, owner: safeboxAddress, chain, block,  }),
            sdk.api.erc20.totalSupply({ target: ibStakingReward, chain, block, }),
            unwrapCreamTokens(tempBalance, [[cyTokenAddress, ibStakingReward]], block, chain, transform),
        ])
        const ratio = balanceOf / totalSupply
        for (const [token, balance] of Object.entries(tempBalance)) {
            sdk.util.sumSingleBalance(balances, token, BigNumber(balance * ratio).toFixed(0))
        }
    }
}


async function tvlV2(block, chain) {
    const { safeBoxApi, coreOracleAddress, latestAlphaHomoraV2GraphUrl, instances } = chainParams[chain];
    const cyTokens = await getCyTokens(block, safeBoxApi, latestAlphaHomoraV2GraphUrl, chain);
    const collateralGroups = await Promise.all(instances.map(params => getTotalCollateral(block, params, chain)))

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

async function getCyTokens(block, safeBoxApi, AlphaHomoraV2GraphUrl, chain) {
    const safebox = await getConfig('alpha-hormora/v2-safebox/'+chain,
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
        permitFailure: true,
    });

    const tokenPrices = {};
    for (let i = 0; i < _ethPrices.length; i++) {
        const price = _ethPrices[i].output / 2 ** 112;
        if (price > 0) {
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
    }, chain
) {
    const pools = await getPools(poolsJsonUrl, chain);

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
