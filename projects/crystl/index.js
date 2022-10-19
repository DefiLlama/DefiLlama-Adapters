const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");
const { getChainTransform } = require("../helper/portedTokens");
const { unwrapLPsAuto, sumTokens2, } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

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
    pools: "https://polygon.crystl.finance/data/pools.json",
  },
  cronos: {
    name: "cronos",
    id: 25,
    crystl_token: "0xCbDE0E17d14F49e10a10302a32d17AE88a7Ecb8B",
    masterhealer: "",
    vaulthealer_v1: "0x4dF0dDc29cE92106eb8C8c17e21083D4e3862533",
    vaulthealer_v2: "",
    apeprice_getter: "0x6993fFaB6FD7c483f33A5E3EFDFEA676425C8F31",
    pools: "https://cronos.crystl.finance/data/pools.json",
  },
};

const wantLockedTotalABI = {
  "inputs": [],
  "name": "wantLockedTotal",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

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

async function moonbeam(timestamp, block, chainBlocks) {
  return fetchChain(CHAIN_DATA.moonbeam, chainBlocks.moonbeam);
}

function getTvl(chain, isPool2) {
  return async (_, _b, chainBlocks) => {
    const block = chainBlocks[chain]
    const poolUrl = CHAIN_DATA[chain].pools
    const chainId = CHAIN_DATA[chain].id
    const crystl = CHAIN_DATA[chain].crystl_token.toLowerCase()
    const toa = [];
    (await get(poolUrl)).forEach(i => {
      const token = i.stakingToken.address[chainId].toLowerCase()
      const contractAddress = i.contractAddress[chainId]
      const isStakingToken = token == crystl
      const addToken = isPool2 ? !isStakingToken : isStakingToken
      if (addToken) toa.push([token, contractAddress])
    })

    return sumTokens2({ chain, block, tokensAndOwners: toa, resolveLP: true, })
  }
}



module.exports = {
  polygon: {
    tvl: polygon,
    pool2: getTvl('polygon', true),
    staking: getTvl('polygon', false),
    // pool2: pool2('0x2aBaF1D78F57f87399B6Ffe76b959363a7C67D58', '0xb8e54c9ea1616beebe11505a419dd8df1000e02a', 'polygon'),
    // staking: stakings(['0xe9DA403d5250997e5484260993c3657B2AA0EF8D', '0x284B5F8fB9b25F195929905567f9B626F989A73a',], '0x76bF0C28e604CC3fE9967c83b3C3F31c213cfE64', 'polygon'),
  },
  cronos: {
    tvl: cronos,
    pool2: getTvl('cronos', true),
    staking: getTvl('cronos', false),
    // pool2: pool2('0x6E20BedB36E24DE4262E563E7Fc6b9789A92953D', '0xdEb28305D5c8d5Ce3B3bc5398Ba81012580a5A11', 'cronos'),
    // staking: stakings(['0x4cFcdCBEC3BD1C411fCf16a078b37630F5EA172A', '0x5053337Aa5bb7BE6062422c576F9e43553a1844B',], '0xcbde0e17d14f49e10a10302a32d17ae88a7ecb8b', 'cronos'),
  },
  bsc: {
    tvl: bsc,
  },
  moonbeam: {
    // tvl: moonbeam,
  },
  methodology:
    "Our TVL is calculated from the Total Value Locked in our Vaults, Farms, and Pools.",
};
