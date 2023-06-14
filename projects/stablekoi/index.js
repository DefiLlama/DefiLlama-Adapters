const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require("../helper/unwrapLPs");
const { getFixBalances } = require("../helper/portedTokens");
const { GraphQLClient, gql } = require("graphql-request");
const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");
const { getConfig } = require('../helper/cache')

const chain = "godwoken";

async function tvl(ts, _block, chainBlocks) {
  const balances = {};
  const fixBalances = await getFixBalances(chain);
  const tokensAndOwners = [];
  const poolInfo = await getConfig('stable-koi-v0', "https://app.stablekoi.com/lists/poollist.json");
  poolInfo.forEach((pool) => {
    pool.tokens.forEach((token) => tokensAndOwners.push([token, pool.address]));
  });
  await sumTokens(balances, tokensAndOwners, chainBlocks[chain], chain);
  return fixBalances(balances);
}

async function tvl_v1(ts, _block, chainBlocks) {
  const balances = {};
  const chain = "godwoken_v1";
  const fixBalances = await getFixBalances(chain);
  const tokensAndOwners = [];
  // const poolInfo = await get('https://app-v1.stablekoi.com/api/pools');
  v1Pools.forEach((pool) => {
    pool.tokens.forEach((token) => tokensAndOwners.push([token.address, pool.address]));
  });
  await sumTokens(balances, tokensAndOwners, chainBlocks[chain], chain);
  return fixBalances(balances);
}

const yokaiInfoAPI =
  "https://www.yokaiswap.com/subgraphs/name/yokaiswap/exchange";
async function fetchTokenPriceFromYokaiSwap(token) {
  const graphQLClient = new GraphQLClient(yokaiInfoAPI);

  const query = gql`
    query tokens {
      tokens(where:{id:\"${token.toLowerCase()}\"}) {
        derivedUSD
      }
    }
  `;

  const data = await graphQLClient.request(query);

  return (data.tokens[0] || { derivedUSD: 0 }).derivedUSD;
}

const koi = "0xd66eb642eE33837531FdA61eb7Ab15B15658BcaB";
const koiStakingRewards = "0x9d7AACf560e493A7B0666d85BDE216d6d38Ec429";
async function staking(ts, _block, chainBlocks) {
  const [{ output: totalStakedKOI }, { output: koiDecimals }, koiPrice] =
    await Promise.all([
      sdk.api.abi.call({
        abi: abi.totalSupply,
        target: koiStakingRewards,
        chain,
        block: chainBlocks[chain],
      }),
      sdk.api.erc20.decimals(koi, chain),
      fetchTokenPriceFromYokaiSwap(koi),
    ]);

  return toUSDTBalances(
    BigNumber(totalStakedKOI)
      .multipliedBy(BigNumber(koiPrice))
      .dividedBy(BigNumber(10).pow(BigNumber(koiDecimals)))
      .toFixed(0)
  );
}

module.exports = {
  godwoken: {
    tvl,
    staking,
  },
  godwoken_v1: {
    tvl: tvl_v1,
  },
  hallmarks: [
    [Math.floor(new Date('2022-08-26')/1e3), "Add godwoken v1 chain tvl"],
  ],
}

const v1Pools = [
  {
    "name": "USDC|eth↔USDC|bsc",
    "address": "0xB76B94bA69f0C2c556ee86F57e57F5F20A705d18",
    "tokens": [
      {
        "name": "USD Coin (Ethereum)",
        "address": "0x186181e225dc1Ad85a4A94164232bD261e351C33",
      },
      {
        "symbol": "USDC|bsc",
        "address": ADDRESSES.godwoken_v1.USDC_bsc,
      }
    ]
  },
  {
    "name": "USDC|eth↔USDT|eth",
    "address": "0xA1F83F8F142c1069d33a898498AFEA6257387133",
    "tokens": [
      {
        "symbol": "USDC|eth",
        "address": "0x186181e225dc1Ad85a4A94164232bD261e351C33",
      },
      {
        "symbol": "USDT|eth",
        "address": "0x8E019acb11C7d17c26D334901fA2ac41C1f44d50",
      }
    ]
  },
  {
    "name": "USDT|eth↔USDT|bsc",
    "address": "0x2c13f5DB105C6ab13ba183Abb7c0CBe38bE45A92",
    "tokens": [
      {
        "symbol": "USDT|eth",
        "address": "0x8E019acb11C7d17c26D334901fA2ac41C1f44d50",
      },
      {
        "symbol": "USDT|bsc",
        "address": ADDRESSES.godwoken_v1.USDT_bsc,
      }
    ]
  },
  {
    "name": "WBTC|eth↔BTCB|bsc",
    "address": "0x2360D9699dc82b684F986fBcc2ddf3Ab54Ff60dD",
    "tokens": [
      {
        "symbol": "WBTC|eth",
        "address": ADDRESSES.godwoken_v1.WBTC_eth,
      },
      {
        "symbol": "BTCB|bsc",
        "address": ADDRESSES.godwoken_v1.BTCB_bsc,
      }
    ]
  }
]