const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensSharedOwners, nullAddress, sumTokens2, } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const { getCache } = require("../helper/http");
const { getUniqueAddresses } = require("../helper/utils");
const { staking } = require("../helper/staking.js");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20Abi = require("../helper/abis/erc20.json");
const contracts = require("./contracts.json");
const { getLogs } = require('../helper/cache/getLogs')

const chains = [
  "ethereum", //-200M
  "polygon", //-40M
  "arbitrum", //G
  "aurora", //G
  "avax", //-30M
  "fantom", //-80M
  "optimism", //-6M
  "xdai", //G
  "moonbeam",
  "celo",
  "kava",
  "base",
  "fraxtal"
]; // Object.keys(contracts);
const registryIds = {
  stableswap: 0,
  stableFactory: 3,
  crypto: 5,
  cryptoFactory: 6
};
const decimalsCache = {}
const nameCache = {}

async function getDecimals(chain, token) {
  token = token.toLowerCase()
  const key = chain + '-' + token
  if (!decimalsCache[key]) decimalsCache[key] = sdk.api.erc20.decimals(token, chain)
  return decimalsCache[key]
}


const gasTokens = [
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ADDRESSES.null,
]

async function getNames(chain, tokens) {
  tokens = tokens.map(i => i.toLowerCase())
  const mapping = {}
  const missing = []
  tokens.forEach(i => {
    const key = chain + '-' + i
    if (key === 'ethereum-0x6b8734ad31d42f5c05a86594314837c416ada984') mapping[i] = ''
    else if (nameCache[key] || gasTokens.includes(i)) mapping[i] = nameCache[key]
    else missing.push(i)
  })

  const res = await sdk.api2.abi.multiCall({
    abi: erc20Abi.name,
    calls: missing,
    chain,
    permitFailure: true,
  })
  res.forEach((name, i) => {
    const key = chain + '-' + missing[i]
    nameCache[key] = name ?? ''
    mapping[missing[i]] = nameCache[key]
  })

  return mapping
}

const registryIdsReverse = Object.fromEntries(Object.entries(registryIds).map(i => i.reverse()))

async function getPool({ chain, block, registry }) {
  const data = await sdk.api2.abi.fetchList({ chain, block, target: registry, itemAbi: abi.pool_list, lengthAbi: abi.pool_count, withMetadata: true, })
  return data.filter(i => i.output)
}

function getRegistryType(registryId) {
  if (!registryIdsReverse[registryId]) throw new Error('Unknown registry id: ' + registryId)
  return registryIdsReverse[registryId]
}

async function getPools(block, chain) {
  let { registriesMapping, addressProvider } = contracts[chain]
  if (!registriesMapping) {
    registriesMapping = {};
    if(addressProvider){
      (await sdk.api.abi.multiCall({
        block, chain,
        calls: Object.values(registryIds).map(r => ({ params: r })),
        target: addressProvider,
        abi: abi.get_id_info
      })).output
        .filter(r => r.output.addr !== nullAddress)
        .forEach(({ input: { params: [registryId] }, output: { addr } }) => registriesMapping[getRegistryType(registryId)] = addr)
    }
  }
  if (contracts[chain].CurveStableswapFactoryNG) {
    registriesMapping.CurveStableswapFactoryNG = contracts[chain].CurveStableswapFactoryNG
  }
  if (contracts[chain].CurveL2TricryptoFactory) {
    registriesMapping.CurveL2TricryptoFactory = contracts[chain].CurveL2TricryptoFactory
  }
  const poolList = {}
  await Promise.all(Object.entries(registriesMapping).map(async ([registry, addr]) => {
    poolList[registry] = await getPool({ chain, block, registry: addr })
  }))

  return poolList
}

function aggregateBalanceCalls({ coins, nCoins, wrapped }) {
  const toa = []
  coins.map(({ input, output }, i) => {
    const owner = input.params[0]
    const addToken = t => {
      if (t.toLowerCase() === wrapped.toLowerCase())
        toa.push([nullAddress, owner])
      toa.push([t, owner])
    }
    if (!Object.keys(nCoins).length)
      output.forEach(token => addToken(token))
    else
      for (let index = 0; index < nCoins[i].output[0]; index++)
        addToken(output[index])
  })
  return toa;
}

async function handleUnlistedFxTokens(balances, chain) {
  if ("fxTokens" in contracts[chain]) {
    const tokens = Object.values(contracts[chain].fxTokens);
    for (let token of tokens) {
      if (token.address in balances) {
        const [rate, { output: decimals }] = await Promise.all([
          getCache(`https://api.exchangerate.host/convert?from=${token.currency}&to=USD`),
          getDecimals(chain, token.address)
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

async function unwrapPools({ poolList, registry, chain, block }) {
  if (!poolList.length) return;
  const registryAddress = poolList[0].input.target

  const callParams = { target: registryAddress, calls: poolList.map(i => ({ params: i.output })), chain, block, }
  const { output: coins } = await sdk.api.abi.multiCall({ ...callParams, abi: abi.get_coins[registry] })
  let nCoins = {}
  if (!['cryptoFactory', 'triCryptoFactory', 'CurveL2TricryptoFactory'].includes(registry))
    nCoins = (await sdk.api.abi.multiCall({ ...callParams, abi: abi.get_n_coins[registry] })).output

  let { wrapped = '', metapoolBases = {}, blacklist = [] } = contracts[chain]
  wrapped = wrapped.toLowerCase()
  let calls = aggregateBalanceCalls({ coins, nCoins, wrapped });
  const allTokens = getUniqueAddresses(calls.map(i => i[0]))
  const tokenNames = await getNames(chain, allTokens)
  const blacklistedTokens = [...blacklist, ...(Object.values(metapoolBases))]
  Object.entries(tokenNames).forEach(([token, name]) => {
    if ((name ?? '').startsWith('Curve.fi ')) {
      sdk.log(chain, 'blacklisting', name)
      blacklistedTokens.push(token)
    }
  })
  return { tokensAndOwners: calls, blacklistedTokens }
}

const blacklists = {
  ethereum: ['0x6b8734ad31d42f5c05a86594314837c416ada984', '0x95ECDC6caAf7E4805FCeF2679A92338351D24297', '0x5aa00dce91409b58b6a1338639b9daa63eb22be7', '0xEf1385D2b5dc6D14d5fecB86D53CdBefeCA20fcC', ADDRESSES.ethereum.CRVUSD, '0x29b41fe7d754b8b43d4060bb43734e436b0b9a33'],
  arbitrum: ['0x3aef260cb6a5b469f970fae7a1e233dbd5939378'],
}

const config = {
  ethereum: {
    plainFactoryConfig: [
      { plainFactory: '0x528baca578523855a64ee9c276826f934c86a54c', fromBlock: 17182168 },
      { plainFactory: '0x0145fd99f1dd6e2491e44fca608c481c9c5b97a9', fromBlock: 17182168 },
      { plainFactory: '0x6a8cbed756804b16e05e741edabd5cb544ae21bf', fromBlock: 17182168 },
    ]
  },
}

async function addPlainFactoryConfig({ api, tokensAndOwners, plainFactoryConfig = [] }) {
  return Promise.all(plainFactoryConfig.map(async ({ plainFactory, fromBlock }) => {
    const logs = await getLogs({
      api,
      target: plainFactory,
      topics: ['0xb8f6972d6e56d21c47621efd7f02fe68f07a17c999c42245b3abd300f34d61eb'],
      eventAbi: 'event PlainPoolDeployed(address[4] coins, uint256 A, uint256 fee, address deployer, address pool)',
      onlyArgs: true,
      fromBlock,
    })
    logs.forEach(log => {
      log.coins.forEach((coin, i) => {
        if (i > 1 && coin === nullAddress) return;
        tokensAndOwners.push([coin, log.pool])
      })
    })
  }))
}

function tvl(chain) {
  const { plainFactoryConfig = [] } = config[chain] ?? {}
  return async (api) => {
    const { block } = api
    let balances = {};
    const transform = await getChainTransform(chain);
    const poolLists = await getPools(block, chain);
    const promises = []

    for (const [registry, poolList] of Object.entries(poolLists))
      promises.push(unwrapPools({ poolList, registry, chain, block }))

    const res = (await Promise.all(promises)).filter(i => i)
    const tokensAndOwners = res.map(i => i.tokensAndOwners).flat()
    const blacklistedTokens = res.map(i => i.blacklistedTokens).flat()
    if (blacklists[chain])
      blacklistedTokens.push(...blacklists[chain])
    await addPlainFactoryConfig({ api, tokensAndOwners, plainFactoryConfig })
    await sumTokens2({ balances, chain, block, tokensAndOwners, transformAddress: transform, blacklistedTokens })
    await handleUnlistedFxTokens(balances, chain);
    return balances;
  };
}

const chainTypeExports = chains => {
  let exports = chains.reduce(
    (obj, chain) => ({ ...obj, [chain]: { tvl: tvl(chain) } }),
    {}
  );
  return exports;
};

module.exports = chainTypeExports(chains);

module.exports.ethereum["staking"] = staking(
  contracts.ethereum.veCRV,
  contracts.ethereum.CRV
);

module.exports.harmony = {
  tvl: async (ts, ethB, chainB) => {
    if (ts > 1655989200) {
      // harmony hack
      return {};
    }
    const block = chainB.harmony
    const balances = {};
    await sumTokensSharedOwners(
      balances,
      [
        "0xef977d2f931c1978db5f6747666fa1eacb0d0339",
        "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f"
      ],
      ["0xC5cfaDA84E902aD92DD40194f0883ad49639b023"],
      block,
      "harmony",
      addr => `harmony:${addr}`
    );
    return balances;
  }
};

module.exports.hallmarks = [
  [1597446675, "CRV Launch"],
  [1621213201, "Convex Launch"],
  [1642374675, "MIM depeg"],
  [1651881600, "UST depeg"],
  [1654822801, "stETH depeg"],
  [1667692800, "FTX collapse"],
  [1690715622, "Reentrancy hack"]
];
