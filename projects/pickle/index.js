const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const utils = require("../helper/utils");
const { unwrapUniswapLPs, unwrapCrv } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const { toUSDT, usdtAddress } = require("../helper/balances");
const { staking } = require("../helper/staking");
const { GraphQLClient, gql } = require("graphql-request");

const excluded = ["pbamm", "pickle-eth", "sushi-pickle-eth"];
const jars_url =
  "https://stkpowy01i.execute-api.us-west-1.amazonaws.com/prod/protocol/pools";

// Contracts
const dillAddress = "0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf";
const pickleAddress = "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5";

const pool2s = [
  {
    contract: "0xfAA267C3Bb25a82CFDB604136a29895D30fd3fd8", // Gauge
    lpToken: "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819", // Uni Pickle-Eth
    chain: "ethereum",
  },
  {
    contract: "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d", // Masterchef
    lpToken: "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819", // Uni Pickle-Eth
    chain: "ethereum",
  },
  {
    contract: "0xEF0881eC094552b2e128Cf945EF17a6752B4Ec5d", // Sushi MC2
    lpToken: "0x269Db91Fc3c7fCC275C2E6f22e5552504512811c", // Sushi Pickle-Eth
    chain: "ethereum",
  },
  {
    contract: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Balancer Vault
    lpToken: "0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac", // Balancer Pickle-Eth
    chain: "arbitrum",
  },
];

async function getBalancerPoolLiquidity(poolAddress, block) {
  // delayed by around 5 mins to allow subgraph to update
  block -= 25;
  var endpoint = `https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2`;
  var graphQLClient = new GraphQLClient(endpoint);
  var query = gql`{
      pools(
        first: 1,
        skip: 0,
        block: {number: ${block}},
        where: {address_in: ["${poolAddress}"]}
      ) {
        address,
        totalLiquidity
      }
    }
    `;

  const results = await graphQLClient.request(query, {
    block,
  });

  const result = results.pools[0];
  const filtered = {
    address: result.address,
    totalLiquidity: result.totalLiquidity,
  };
  return filtered;
}

function chainTvl(chain) {
  return async (_timestamp, _ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];
    const transformAddress = await getChainTransform(chain);
    const balances = {};

    let jars = (await utils.fetchURL(jars_url)).data
      .map((jar) => {
        if (jar.network === (chain === "ethereum" ? "eth" : chain))
          return {
            ...jar,
            name: jar.identifier,
          };
      })
      .filter((x) => x && !excluded.includes(x.name));

    const jar_balances = (
      await sdk.api.abi.multiCall({
        block,
        calls: jars.map((jar) => ({
          target: jar.jarAddress,
        })),
        abi: abi.balance,
        chain,
      })
    ).output.map((val) => val.output);

    const lpPositions = [];

    await Promise.all(
      jars.map(async (jar, idx) => {
        if (
          ((jar.name.includes("crv") || jar.name === "dodohndeth") &&
            chain === "arbitrum") ||
          jar.name === "rbn-eth"
        ) {
          sdk.util.sumSingleBalance(
            balances,
            usdtAddress,
            toUSDT(jar.liquidity_locked)
          );
        } else if (
          jar.name.toLowerCase().includes("crv") &&
          jar.name != "yvecrv-eth"
        ) {
          await unwrapCrv(
            balances,
            jar.tokenAddress,
            jar_balances[idx],
            block,
            chain,
            transformAddress
          );
        } else if (jar.name.includes("-") || jar.name.includes("lp")) {
          lpPositions.push({
            balance: jar_balances[idx],
            token: jar.tokenAddress,
          });
        } else if (jar.name === "aleth") {
          sdk.util.sumSingleBalance(
            // sum as weth
            balances,
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            jar_balances[idx]
          );
        } else {
          sdk.util.sumSingleBalance(
            balances,
            transformAddress(jar.tokenAddress),
            jar_balances[idx]
          );
        }
      })
    );
    await unwrapUniswapLPs(
      balances,
      lpPositions,
      block,
      chain,
      transformAddress
    );

    return balances;
  };
}

function chainPool2(chain) {
  return async (_timestamp, _ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];
    const transformAddress = await getChainTransform(chain);
    const balances = {};

    const chainPool2s = pool2s.filter((pool) => pool.chain === chain);

    if (chain === "ethereum") {
      const pool2Balances = await Promise.all(
        chainPool2s.map(async (pool) => {
          return (
            await sdk.api.erc20.balanceOf({
              target: pool.lpToken,
              owner: pool.contract,
            })
          ).output;
        })
      );

      const lpPositions = chainPool2s.map((pool, idx) => {
        return {
          balance: pool2Balances[idx],
          token: pool.lpToken,
        };
      });

      await unwrapUniswapLPs(
        balances,
        lpPositions,
        block,
        chain,
        transformAddress
      );
    } else if (chain === "arbitrum") {
      const pool2Balances = await Promise.all(
        chainPool2s.map(async (pool) => {
          return await getBalancerPoolLiquidity(pool.lpToken, block);
        })
      );

      pool2Balances.forEach((pool) => {
        sdk.util.sumSingleBalance(
          balances,
          usdtAddress,
          toUSDT(pool.totalLiquidity)
        );
      });
    }
    return balances;
  };
}

module.exports = {
  arbitrum: {
    tvl: chainTvl("arbitrum"),
    pool2: chainPool2("arbitrum"),
  },
  ethereum: {
    tvl: chainTvl("ethereum"),
    staking: staking(dillAddress, pickleAddress),
    pool2: chainPool2("ethereum"),
  },
  polygon: {
    tvl: chainTvl("polygon"),
  },
};
