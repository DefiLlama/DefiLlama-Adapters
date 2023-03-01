const sdk = require("@defillama/sdk");
const { transformBalances } = require("../helper/portedTokens");
const { getLogs, } = require("../helper/cache/getLogs");

const { sumTokens2 } = require("../helper/unwrapLPs");
const { queryV1Beta1 } = require("../helper/chain/cosmos");
let data;

async function getData() {
  if (!data) data = _getData()
  return data
  async function _getData() {
    const { registry } = await queryV1Beta1({ url: '/leverage/v1/registered_tokens', chain: 'umee'})
    return Promise.all(registry.map(async i => {
      const res = await queryV1Beta1({ url: '/leverage/v1/market_summary?denom='+i.base_denom, chain: 'umee'})
      return {
        base_denom: i.base_denom,
        borrowed: parseInt(res.borrowed),
        supplied: parseInt(res.supplied),
        exponent: parseInt(i.exponent),
      }
    }))
  }
}

async function tvl() {
  const balances = {};
  const data = await getData();
  data.forEach((i) =>
    sdk.util.sumSingleBalance(balances, i.base_denom, i.supplied - i.borrowed)
  );
  return transformBalances("umee", balances);
}

async function borrowed() {
  const balances = {};
  const data = await getData();
  data.forEach((i) =>
    sdk.util.sumSingleBalance(balances, i.base_denom, i.borrowed)
  );
  return transformBalances("umee", balances);
}

async function ethTvl(_, _b, _cb, { api }) {
  const logs = await getLogs({
    api,
    target: "0xe296db0a0e9a225202717e9812bf29ca4f333ba6",
    topics: [
      "0x3a0ca721fc364424566385a1aa271ed508cc2c0949c2272575fb3013a163a45f",
    ],
    fromBlock: 14216544,
    eventAbi:
      "event ReserveInitialized (address indexed asset, address indexed aToken, address stableDebtToken, address variableDebtToken, address interestRateStrategyAddress)",
    onlyArgs: true,
  });
  const tokensAndOwners = logs.map((i) => [i.asset, i.aToken]);
  return sumTokens2({ api, tokensAndOwners });
}

async function ethBorrowed(_, _b, _cb, { api }) {
  const balances = {};
  const logs = await getLogs({
    api,
    target: "0xe296db0a0e9a225202717e9812bf29ca4f333ba6",
    topics: [
      "0x3a0ca721fc364424566385a1aa271ed508cc2c0949c2272575fb3013a163a45f",
    ],
    fromBlock: 14216544,
    eventAbi:
      "event ReserveInitialized (address indexed asset, address indexed aToken, address stableDebtToken, address variableDebtToken, address interestRateStrategyAddress)",
    onlyArgs: true,
  });
  const [stableDebtSupplies, variableDebtSupplies] = await Promise.all([
    api.multiCall({
      abi: "uint256:totalSupply",
      calls: logs.map((i) => i.stableDebtToken),
    }),
    api.multiCall({
      abi: "uint256:totalSupply",
      calls: logs.map((i) => i.variableDebtToken),
    }),
  ]);
  logs.forEach((v, i) => {
    sdk.util.sumSingleBalance(
      balances,
      v.asset,
      stableDebtSupplies[i],
      api.chain
    );
    sdk.util.sumSingleBalance(
      balances,
      v.asset,
      variableDebtSupplies[i],
      api.chain
    );
  });
  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "Total supplied assets - total borrowed assets",
  umee: {
    tvl,
    borrowed,
  },
  ethereum: {
    tvl: ethTvl,
    borrowed: ethBorrowed,
  },
};
