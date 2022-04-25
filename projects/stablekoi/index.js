const { sumTokens } = require("../helper/unwrapLPs");
const { getFixBalances } = require("../helper/portedTokens");
const retry = require("../helper/retry");
const axios = require("axios");
const { GraphQLClient, gql } = require("graphql-request");
const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");

const chain = "godwoken";

async function getPoolInfo() {
  return (
    await retry(
      async () =>
        await axios.get("https://app.stablekoi.com/lists/poollist.json")
    )
  ).data;
}

async function tvl(ts, _block, chainBlocks) {
  const balances = {};
  const fixBalances = await getFixBalances(chain);
  const tokensAndOwners = [];
  const poolInfo = await getPoolInfo();
  poolInfo.forEach((pool) => {
    pool.tokens.forEach((token) => tokensAndOwners.push([token, pool.address]));
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

  return data.tokens[0].derivedUSD;
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
}
