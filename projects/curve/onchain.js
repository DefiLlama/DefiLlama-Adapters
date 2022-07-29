const { unwrapYearn, sumTokensSharedOwners } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const { staking } = require("../helper/staking.js");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const creamAbi = require("../helper/abis/cream.json");
const contracts = require("./contracts.json");
const { requery } = require("../helper/requery");
const { default: axios } = require("axios");
const retry = require("async-retry");
const { getBlock } = require("../helper/getBlock");
const chains = [
  "ethereum", //-200M
  "polygon", //-40M
  "arbitrum", //G
  "aurora", //G
  "avax", //-30M
  "fantom", //-80M
  "optimism", //-6M
  "xdai", //G
  "moonbeam"
]; // Object.keys(contracts);
const registryIds = {
  stableswap: 0,
  stableFactory: 3,
  crypto: 5,
  cryptoFactory: 6
};

async function getPools(block, chain) {
  const registries = (await sdk.api.abi.multiCall({
    block,
    chain,
    calls: Object.values(registryIds).map(r => ({
      params: r
    })),
    target: contracts[chain].addressProvider,
    abi: abi.get_id_info
  })).output.map(r => r.output.addr);

  const poolCounts = (await sdk.api.abi.multiCall({
    block,
    chain,
    calls: registries.map(r => ({
      target: r
    })),
    abi: abi.pool_count
  })).output;

  const pools = {};
  for (let i = 0; i < Object.values(registryIds).length; i++) {
    pools[Object.keys(registryIds)[i]] = (await sdk.api.abi.multiCall({
      calls: [...Array(Number(poolCounts[i].output)).keys()].map(n => ({
        target: poolCounts[i].input.target,
        params: [n]
      })),
      block,
      chain,
      abi: abi.pool_list
    })).output;
  }

  let allPools = {}
  Object.entries(pools).map(([key, list])=>{
    pools[key] = list.filter(p=>{
      if(allPools[p.output] === undefined){
        allPools[p.output] = true
        return true
      } else {
        return false
      }
    })
  })

  return pools;
}

function aggregateBalanceCalls(coins, nCoins, poolList, registry) {
  let calls = [];
  if (registry == "cryptoFactory") {
    coins.map((coin, i) =>
      [...Array(Number(coin.output.length)).keys()].map(n =>
        calls.push({
          params: [poolList[i].output],
          target: coin.output[n]
        })
      )
    );
  } else {
    coins.map((coin, i) =>
      [...Array(Number(nCoins[i].output[0])).keys()].map(n =>
        calls.push({
          params: [poolList[i].output],
          target: coin.output[n]
        })
      )
    );
  }
  return calls;
}

async function fixGasTokenBalances(poolBalances, block, chain) {
  for (let i = 0; i < poolBalances.output.length; i++) {
    if (
      poolBalances.output[i].success == false &&
      poolBalances.output[i].input.target.toLowerCase() ==
        contracts[chain].gasTokenDummy
    ) {
      const ethBalance = (await sdk.api.eth.getBalance({
        target: poolBalances.output[i].input.params[0],
        block,
        chain
      })).output;

      poolBalances.output[i].success = true;
      poolBalances.output[i].output = ethBalance;
      poolBalances.output[i].input.target = contracts[chain].wrapped;
    }
  }
}

async function fixWrappedTokenBalances(balances, block, chain, transform) {
  if ("yearnTokens" in contracts[chain]) {
    for (let token of Object.values(contracts[chain].yearnTokens)) {
      if (token in balances) {
        await unwrapYearn(balances, token, block, chain, transform);
      }
    }
  }

  if ("creamTokens" in contracts[chain]) {
    const creamTokens = Object.values(contracts[chain].creamTokens);
    await unwrapCreamTokens(balances, block, chain, creamTokens, transform);
  }

  if ("sdTokens" in contracts[chain]) {
    await unwrapSdTokens(balances, contracts[chain].sdTokens, chain);
  }

  const stDOT = "moonbeam:0xfa36fe1da08c89ec72ea1f0143a35bfd5daea108"
  if(stDOT in balances){
    balances["bsc:0x7083609fce4d1d8dc0c979aab8c869ea2c873402"] = BigNumber(balances[stDOT]).times(1e8).toFixed(0)
    delete balances[stDOT]
  }
}

async function unwrapCreamTokens(
  balances,
  block,
  chain,
  creamTokens,
  transform
) {
  const [exchangeRates, underlyingTokens] = await Promise.all([
    sdk.api.abi.multiCall({
      calls: creamTokens.map(t => ({
        target: t
      })),
      abi: creamAbi.exchangeRateStored,
      block,
      chain
    }),
    sdk.api.abi.multiCall({
      calls: creamTokens.map(t => ({
        target: t
      })),
      abi: creamAbi.underlying,
      block,
      chain
    })
  ]);
  for (let i = 0; i < creamTokens.length; i++) {
    if (!(creamTokens[i] in balances)) continue;
    const underlying = underlyingTokens.output[i].output;
    const balance = BigNumber(balances[creamTokens[i]])
      .times(exchangeRates.output[i].output)
      .div(1e18)
      .toFixed(0);
    sdk.util.sumSingleBalance(balances, transform(underlying), balance);
    delete balances[creamTokens[i]];
    delete balances[`${chain}:${creamTokens[i]}`];
  }
}

function deleteMetapoolBaseBalances(balances, chain) {
  for (let token of Object.values(contracts[chain].metapoolBases)) {
    if (!(token in balances || `${chain}:${token}` in balances)) continue;
    delete balances[token];
    delete balances[`${chain}:${token}`];
  }
}

function mapGaugeTokenBalances(calls, chain) {
  const mapping = {
    // token listed in coins() mapped to gauge token held in contract
    //"0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171": "0x19793b454d3afc7b454f206ffe95ade26ca6912c", // maybe not? 4 0s poly
    "0x7f90122bf0700f9e7e1f688fe926940e8839f353": {
      to: "0xbf7e49483881c76487b0989cd7d9a8239b20ca41",
      pools: ["0x30df229cefa463e991e29d42db0bae2e122b2ac7"],
      chains: []
    }, // need a pool conditional - only for (1) ['0x30dF229cefa463e991e29D42DB0bae2e122B2AC7']
    "0xd02a30d33153877bc20e5721ee53dedee0422b2f": {
      to: "0xd4f94d0aaa640bbb72b5eec2d85f6d114d81a88e",
      pools: [],
      chains: []
    },
    "0x1337bedc9d22ecbe766df105c9623922a27963ec": {
      to: "0x5b5cfe992adac0c9d48e05854b2d91c73a003858",
      pools: [],
      chains: ["avax"]
    },
    "0x7f90122bf0700f9e7e1f688fe926940e8839f353": {
      to: "0xbF7E49483881C76487b0989CD7d9A8239B20CA41",
      pools: [],
      chains: ["arbitrum"]
    },
    "0x27e611fd27b276acbd5ffd632e5eaebec9761e40": {
      to: "0x8866414733F22295b7563f9C5299715D2D76CAf4",
      pools: [],
      chains: ["fantom"]
    },
    "0xd02a30d33153877bc20e5721ee53dedee0422b2f": {
      to: "0xd4f94d0aaa640bbb72b5eec2d85f6d114d81a88e",
      pools: [],
      chains: ["fantom"]
    }
  };

  return calls.map(function(c) {
    let target = c.target;
    if (
      c.target.toLowerCase() in mapping &&
      (mapping[c.target.toLowerCase()].pools.includes(
        c.params[0].toLowerCase()
      ) ||
        mapping[c.target.toLowerCase()].chains.includes(chain))
    ) {
      target = mapping[c.target.toLowerCase()].to;
    }
    return { target, params: c.params };
  });
}

async function unwrapSdTokens(balances, sdTokens, chain) {
  const apiData = (await retry(
    async bail => await axios.get("https://lockers.stakedao.org/api/lockers")
  )).data.map(t => ({
    address: t.tokenReceipt.address.toLowerCase(),
    usdPrice: t.tokenPriceUSD,
    decimals: t.tokenReceipt.decimals
  }));

  for (let token of Object.values(sdTokens)) {
    if (token in balances) {
      const tokenInfo = apiData.filter(t => t.address == token)[0];

      sdk.util.sumSingleBalance(
        balances,
        "usd-coin",
        balances[token] * tokenInfo.usdPrice / 10 ** tokenInfo.decimals
      );
      delete balances[token];
      delete balances[`${chain}:{token}`];
    }
  }
}

async function handleUnlistedFxTokens(balances, chain) {
  if ("fxTokens" in contracts[chain]) {
    const tokens = Object.values(contracts[chain].fxTokens);
    for (let token of tokens) {
      if (token.address in balances) {
        const [{ data: rate }, { output: decimals }] = await Promise.all([
          retry(
            async bail =>
              await axios.get(
                `https://api.exchangerate.host/convert?from=${token.currency}&to=USD`
              )
          ),
          sdk.api.erc20.decimals(token.address, chain)
        ]);

        sdk.util.sumSingleBalance(
          balances,
          "usd-coin",
          balances[token.address] * rate.result / 10 ** decimals
        );
        delete balances[token.address];
        delete balances[`${chain}:${token.address}`];
      }
    }
  }
  return;
}

async function unwrapPools(
  balances,
  block,
  chain,
  transform,
  poolList,
  registry
) {
  const [{ output: nCoins }, { output: coins }] = await Promise.all([
    sdk.api.abi.multiCall({
      calls: poolList.map(p => ({
        target: p.input.target,
        params: [p.output]
      })),
      block,
      chain,
      abi: abi.get_n_coins[registry]
    }),
    sdk.api.abi.multiCall({
      calls: poolList.map(p => ({
        target: p.input.target,
        params: p.output
      })),
      block,
      chain,
      abi: abi.get_coins[registry]
    })
  ]);

  let calls = aggregateBalanceCalls(coins, nCoins, poolList, registry);
  calls = mapGaugeTokenBalances(calls, chain);

  let poolBalances = await sdk.api.abi.multiCall({
    calls,
    block,
    chain,
    abi: "erc20:balanceOf"
  });
  requery(poolBalances, chain, block, "erc20:balanceOf");
  await fixGasTokenBalances(poolBalances, block, chain);

  sdk.util.sumMultiBalanceOf(balances, poolBalances, false, transform);

  await fixWrappedTokenBalances(balances, block, chain, transform);
  await handleUnlistedFxTokens(balances, chain);
  deleteMetapoolBaseBalances(balances, chain);

  return balances;
} // node test.js projects/curve/index.js

function tvl(chain) {
  return async (_t, _e, chainBlocks) => {
    let balances = {};
    const transform = await getChainTransform(chain);
    const poolList = await getPools(chainBlocks[chain], chain);
    const block = await getBlock(_t, chain, chainBlocks, true)

    for (let registry of Object.keys(poolList)) {
      await unwrapPools(
        balances,
        block,
        chain,
        transform,
        poolList[registry],
        registry
      );
    }

    return balances;
  };
}

const chainTypeExports = chains => {
  let exports = chains.reduce(
    (obj, chain) => ({ ...obj, [chain]: { tvl: tvl(chain) } }),
    {}
  );
  exports.ethereum["staking"] = staking(
    contracts.ethereum.veCRV,
    contracts.ethereum.CRV
  );

  exports.harmony = {
    tvl: async (ts, ethB, chainB) => {
      const block = await getBlock(ts, "harmony", chainB, true)
      const balances = {}
      await sumTokensSharedOwners(balances, 
        ["0xef977d2f931c1978db5f6747666fa1eacb0d0339", "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f"],
        ["0xC5cfaDA84E902aD92DD40194f0883ad49639b023"],
        block,
        "harmony",
        addr=>`harmony:${addr}`
      )
      return balances
    }
  }
  return exports;
};

module.exports = chainTypeExports(chains);
