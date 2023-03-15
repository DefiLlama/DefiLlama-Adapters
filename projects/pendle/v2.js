const abi = require("./abi.json");
const contracts = require("./contracts");
const { request, gql } = require("graphql-request");
const { call, multiCall } = require("@defillama/sdk/build/abi");
const { sumSingleBalance } = require("@defillama/sdk/build/generalUtil");
const { getBlock } = require("../helper/http");
const api = "https://api-v2.pendle.finance/core/graphql";
const chainIdMap = { ethereum: 1, arbitrum: 42161 };

function tvl(chain) {
  const query = gql`
    query {
      markets(chainId: ${chainIdMap[chain]}) {
        results {
          address
          sy {
            address
          }
        }
      }
    }
  `;

  return async (timestamp, block, chainBlocks) => {
    block = await getBlock(timestamp, chain, chainBlocks);
    const balances = {};
    const res = await request(api, query);
    const sys = [...new Set(res.markets.results.map(r => r.sy.address))];

    const [underlyings, supplies, rates] = await Promise.all([
      multiCall({
        calls: sys.map(sy => ({
          target: sy,
        })),
        abi: abi.assetInfo,
        block,
        chain,
      }).then(c =>
        c.output.map(o => ({
          address: o.output.assetAddress,
          decimals: o.output.assetDecimals,
        })),
      ),
      multiCall({
        calls: sys.map(sy => ({
          target: sy,
        })),
        abi: "erc20:totalSupply",
        block,
        chain,
      }).then(c => c.output.map(o => o.output)),
      multiCall({
        calls: sys.map(sy => ({
          target: sy,
        })),
        abi: abi.exchangeRate,
        block,
        chain,
      }).then(c => c.output.map(o => o.output)),
    ]);
    underlyings.map((u, i) => {
      sumSingleBalance(
        balances,
        `${chain == "ethereum" ? "" : `${chain}:`}${u.address}`,
        supplies[i] * rates[i] / 10 ** u.decimals,
      );
    });

    return balances;
  };
}
async function staking(_, block) {
  return {
    [contracts.v2.PENDLE]: (await call({
      target: contracts.v2.PENDLE,
      abi: "erc20:balanceOf",
      block,
      params: [contracts.v2.vePENDLE],
    })).output,
  };
}
module.exports = {
  ethereum: {
    tvl: tvl("ethereum"),
    staking,
  },
  arbitrum: {
    tvl: tvl("arbitrum"),
  },
};
