const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");
const { getChainTransform } = require("../helper/portedTokens");
const { unwrapLPsAuto, } = require("../helper/unwrapLPs");

const CHAIN_DATA = {
  bsc: {
    name: "bsc",
    id: 56,
  },
  moonbeam: {
    name: "moonbeam",
    id: 1284,
  },
  polygon: {
    name: "polygon",
    id: 137,
    crystl_token: "0x76bF0C28e604CC3fE9967c83b3C3F31c213cfE64",
    masterhealer: "0xeBCC84D2A73f0c9E23066089C6C24F4629Ef1e6d",
    vaulthealer_v1: "0xDB48731c021bdB3d73Abb771B4D7aF0F43C0aC16",
    vaulthealer_v2: "0xD4d696ad5A7779F4D3A0Fc1361adf46eC51C632d",
    apeprice_getter: "0x05D6C73D7de6E02B3f57677f849843c03320681c",
  },
  cronos: {
    name: "cronos",
    id: 25,
    crystl_token: "0xCbDE0E17d14F49e10a10302a32d17AE88a7Ecb8B",
    masterhealer: "",
    vaulthealer_v1: "0x4dF0dDc29cE92106eb8C8c17e21083D4e3862533",
    vaulthealer_v2: "",
    apeprice_getter: "0x6993fFaB6FD7c483f33A5E3EFDFEA676425C8F31",
  },
};

const wantLockedTotalABI = "uint256:wantLockedTotal"

let _pools

async function getPools(chainData) {
  if (!_pools) _pools = _getPools()
  let p = (await _pools).filter(i => +i.chainId === chainData.id)
  const pObject = p.reduce((acc, i) => ({ ...acc, [i.strategyAddress]: i }), {})
  return Object.values(pObject)

  async function _getPools() {
    const poolsResponse = await Promise.all([
      'https://raw.githubusercontent.com/polycrystal/crystl-config/main/vaults/vaults.json',
      'https://raw.githubusercontent.com/polycrystal/crystl-config/main/vaults/vaultsV3.json',
      'https://raw.githubusercontent.com/polycrystal/crystl-config/main/pools/boostPools.json',
    ].map(get))

    const pools = poolsResponse.flat()

    pools.forEach(i => {
      if (!i.strategyAddress) i.strategyAddress = i.stratAddress
      if (!i.wantAddress) i.wantAddress = i.wantTokenAddress
    })
    return pools
  }
}

async function fetchChain(chainData, block) {
  let balances = {};
  const chain = chainData.name
  const pools = await getPools(chainData)
  const { output: totals } = await sdk.api.abi.multiCall({
    abi: wantLockedTotalABI,
    calls: pools.map(i => ({ target: i.strategyAddress })),
    chain, block,
  })
  const transform = await getChainTransform(chain)
  totals.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances, transform(pools[i].wantAddress), output))
  await unwrapLPsAuto({ balances, chain, block, transformAddress: transform, })
  return balances;
}

async function polygon(timestamp, block, chainBlocks) {
  return fetchChain(CHAIN_DATA.polygon, chainBlocks.polygon);
}

async function cronos(timestamp, block, chainBlocks) {
  return fetchChain(CHAIN_DATA.cronos, chainBlocks.cronos);
}

async function bsc(timestamp, block, chainBlocks) {
  return fetchChain(CHAIN_DATA.bsc, chainBlocks.bsc);
}

module.exports = {
  hallmarks: [
    [1656590400,"Protocol End"] // https://crystlfinance.medium.com/wrapping-up-crystl-finance-4743287a6bf
  ],
  polygon: {
    tvl: polygon,
  },
  cronos: {
    tvl: cronos,
  },
  bsc: {
    tvl: bsc,
  },
  methodology:
    "Our TVL is calculated from the Total Value Locked in our Vaults, Farms, and Pools.",
};
