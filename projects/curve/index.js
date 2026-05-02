const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokens2, } = require("../helper/unwrapLPs");
const { getUniqueAddresses } = require("../helper/utils");
const { staking } = require("../helper/staking.js");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20Abi = require("../helper/abis/erc20.json");
const contracts = require("./contracts.json");
const { getLogs } = require('../helper/cache/getLogs')

// https://docs.curve.finance/deployments/interactive-deployments/
const chains = [
  "ethereum",
  "polygon",
  "arbitrum",
  "aurora",
  "avax",
  "fantom",
  "optimism",
  "xdai",
  "moonbeam",
  "celo",
  "kava",
  "base",
  "fraxtal",
  "xlayer",
  "bsc",
  "mantle",
  "taiko",
  "corn",
  "sonic",
  "ink",
  "hyperliquid",
  "plume_mainnet",
  "xdc",
  "tac",
  "etlk",
  "plasma",
  "unichain",
  "stable",
  "monad"
];
const registryIds = {
  stableswap: 0,
  stableFactory: 3,
  crypto: 5,
  cryptoFactory: 6
};
const nameCache = {}

const blacklistedPools = {
  ethereum: [
    '0xcc7d5785AD5755B6164e21495E07aDb0Ff11C2A8', // oETH
    '0xAA5A67c256e27A5d80712c51971408db3370927D', // DOLA-3crv
    '0xc528b0571D0BE4153AEb8DdB8cCeEE63C3Dd7760',
    '0x8272E1A3dBef607C04AA6e5BD3a1A134c8ac063B'
  ],
  base: [  ]
}

const globalBlacklistedTokens = {
  base: [
    '0xdbfefd2e8460a6ee4955a68582f85708baea60a3', // superOETHb
  ]
}

const gasTokens = [
  ADDRESSES.GAS_TOKEN_2,
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
    if (addressProvider) {
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
  if (contracts[chain].CurveTricryptoFactoryNG) {
    registriesMapping.CurveTricryptoFactoryNG = contracts[chain].CurveTricryptoFactoryNG
  }
  if (contracts[chain].CurveTwocryptoFactoryNG) {
    registriesMapping.CurveTwocryptoFactoryNG = contracts[chain].CurveTwocryptoFactoryNG
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

async function unwrapPools({ poolList, registry, chain, block }) {
  if (!poolList.length) return;
  const registryAddress = poolList[0].input.target

  const callParams = { target: registryAddress, calls: poolList.map(i => ({ params: i.output })), chain, block, }
  const { output: coins } = await sdk.api.abi.multiCall({ ...callParams, abi: abi.get_coins[registry] })
  let nCoins = {}
  if (!['cryptoFactory', 'triCryptoFactory', 'CurveL2TricryptoFactory', 'CurveTricryptoFactoryNG', 'CurveTwocryptoFactoryNG'].includes(registry))
    nCoins = (await sdk.api.abi.multiCall({ ...callParams, abi: abi.get_n_coins[registry] })).output

  let { wrapped = '', metapoolBases = {}, blacklist = [] } = contracts[chain]
  wrapped = wrapped.toLowerCase()
  let calls = aggregateBalanceCalls({ coins, nCoins, wrapped });
  const allTokens = getUniqueAddresses(calls.map(i => i[0]))
  const tokenNames = await getNames(chain, allTokens)
  const blacklistedTokens = [...blacklist, ...(Object.values(metapoolBases)), ...(globalBlacklistedTokens[chain] ?? [])]
  Object.entries(tokenNames).forEach(([token, name]) => {
    if ((name ?? '').startsWith('Curve.fi ')) {
      // sdk.log(chain, 'blacklisting', name)
      blacklistedTokens.push(token)
    }
  })
  return { tokensAndOwners: calls, blacklistedTokens }
}

const blacklists = {
  ethereum: ['0x6b8734ad31d42f5c05a86594314837c416ada984', '0x29b41fe7d754b8b43d4060bb43734e436b0b9a33'],
  arbitrum: ['0x3aef260cb6a5b469f970fae7a1e233dbd5939378', '0xd4fe6e1e37dfcf35e9eeb54d4cca149d1c10239f'],
}

const excludePoolsIfTheyHoldToken = {
  ethereum: [
    // "0x5e8422345238f34275888049021821e8e08caa1f", // frxETH
    // "0xcacd6fd266af91b8aed52accc382b4e165586e29", // frxUSD
    // "0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3", // oETH
  ],
  base: [
    //   "0xdbfefd2e8460a6ee4955a68582f85708baea60a3", // superOETHb
  ]
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

function buildTokenToPoolsIndex(tokensAndOwners) {
  const idx = new Map()
  for (const [token, owner] of tokensAndOwners) {
    if (!token || token === nullAddress) continue
    const t = token.toLowerCase()
    const p = owner.toLowerCase()
    if (!idx.has(t)) idx.set(t, new Set())
    idx.get(t).add(p)
  }
  return idx
}

function excludePoolsThatHoldCertainTokens({ tokensAndOwners, tokensToAvoid }) {
  if (!tokensToAvoid?.length) return { tokensAndOwners, excludedPools: [], poolReasons: {}, tokenToPools: {} }
  const tokenIdx = buildTokenToPoolsIndex(tokensAndOwners)
  const poolsToExclude = new Set()
  const reason = {}
  const tokenToPools = {}
  for (const rawToken of tokensToAvoid) {
    const t = rawToken.toLowerCase()
    const pools = tokenIdx.get(t)
    if (pools) {
      tokenToPools[t] = Array.from(pools)
      for (const p of pools) {
        poolsToExclude.add(p)
        if (!reason[p]) reason[p] = new Set()
        reason[p].add(t)
      }
    } else {
      tokenToPools[t] = []
    }
  }
  if (!poolsToExclude.size) return { tokensAndOwners, excludedPools: [], poolReasons: {}, tokenToPools }
  const filtered = tokensAndOwners.filter(([token, owner]) => !poolsToExclude.has(owner.toLowerCase()))
  const poolReasons = Object.fromEntries(Object.entries(reason).map(([p, s]) => [p, Array.from(s)]))
  return { tokensAndOwners: filtered, excludedPools: Array.from(poolsToExclude), poolReasons, tokenToPools }
}

async function tvl(api) {
  const chain = api.chain
  const { plainFactoryConfig = [] } = config[chain] ?? {}
  const { block } = api
  let balances = {};
  let poolLists = await getPools(block, chain);
  const bl = new Set((blacklistedPools[chain] || []).map(a => a.toLowerCase()));

  for (const [registry, pools] of Object.entries(poolLists)) {
    poolLists[registry] = pools.filter(p => !bl.has(p.output.toLowerCase()))
  }

  const promises = []
  for (const [registry, poolList] of Object.entries(poolLists))
    promises.push(unwrapPools({ poolList, registry, chain, block }))

  const res = (await Promise.all(promises)).filter(i => i)
  let tokensAndOwners = res.map(i => i.tokensAndOwners).flat()
  const blacklistedTokens = res.map(i => i.blacklistedTokens).flat()
  if (blacklists[chain])
    blacklistedTokens.push(...blacklists[chain])
  await addPlainFactoryConfig({ api, tokensAndOwners, plainFactoryConfig })

  const tokensToAvoid = (excludePoolsIfTheyHoldToken[chain] || []).map(s => s.toLowerCase())
  const { tokensAndOwners: filteredTOA, excludedPools, poolReasons, tokenToPools } =
    excludePoolsThatHoldCertainTokens({ tokensAndOwners, tokensToAvoid })

  if (tokensToAvoid.length) {
    Object.entries(tokenToPools).forEach(([t, pools]) => {
      if (pools.length) sdk.log(chain, 'token triggers exclusion:', t, 'in pools:', pools)
      else sdk.log(chain, 'token triggers exclusion:', t, 'but no pools found')
    })
  }
  if (excludedPools?.length) {
    sdk.log(chain, 'excluded pools (by token content):', excludedPools)
    Object.entries(poolReasons).forEach(([pool, tokens]) => {
      sdk.log(chain, 'excluded pool reason:', pool, 'contains tokens:', tokens)
    })
  }
  tokensAndOwners = filteredTOA

  await sumTokens2({ balances, chain, block, tokensAndOwners, blacklistedTokens, permitFailure: true, })
  return balances;
}

const chainTypeExports = chains => {
  let exports = chains.reduce(
    (obj, chain) => ({ ...obj, [chain]: { tvl } }),
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
  tvl: async (api) => {
    if (api?.timestamp && api.timestamp > 1655989200) {
      // harmony hack
      return {};
    }
    return api.sumTokens({
      owner: '0xC5cfaDA84E902aD92DD40194f0883ad49639b023', tokens: [
        "0xef977d2f931c1978db5f6747666fa1eacb0d0339",
        "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f"
      ]
    })
  }
};

module.exports.hallmarks = [
  ['2020-08-14', "CRV Launch"],
  ['2021-05-17', "Convex Launch"],
  ['2022-01-16', "MIM depeg"],
  ['2022-05-07', "UST depeg"],
  ['2022-06-10', "stETH depeg"],
  ['2022-11-06', "FTX collapse"],
  // ['2023-07-30', "Reentrancy hack"]
];