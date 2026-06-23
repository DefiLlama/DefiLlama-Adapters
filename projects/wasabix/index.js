const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "getPoolTotalDeposited": "function getPoolTotalDeposited(uint256 _poolId) view returns (uint256)",
    "totalDeposited": "uint256:totalDeposited",
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accRewardPerShare, uint256 workingSupply, uint256 totalDeposited, bool needVesting, uint256 earlyWithdrawFee, uint256 withdrawLock, bool veBoostEnabled)"
  };
const { stakings } = require('../helper/staking')
const { pool2s } = require('../helper/pool2')

const tokens = {
  dai: ADDRESSES.ethereum.DAI,
  wausd: '0xc2db4c131adaf01c15a1db654c040c8578929d55',
  wbtc: ADDRESSES.ethereum.WBTC,
  lusd: ADDRESSES.ethereum.LUSD,
  walusd: '0xcbf335Bb8eE86A5A88bEbCda4506a665aA8d7022',
  wabtc: '0xfd8e70e83e399307db3978d3f34b060a06792c36',
  wasabi: '0x896e145568624a498c5a909187363AE947631503',
  weth: ADDRESSES.ethereum.WETH,
  waeth: '0x6a1fbefdF67445C7F531b4F3e04Ffb37b7b13794',
  crv: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  usdc: ADDRESSES.ethereum.USDC,
}

const contracts = {
  vault: {
    dai: {
      yearn: '0x5cefb9f7c53a1b0c78e239b2445ddd2d362b7076',
      idle: '0x894CcdBED28E294482fECf10eAC5962148bf4E15',
      pickle: '0x2de9441c3e22725474146450fc3467a2c778040f',
    },
    wbtc: {
      vesper: '0x26a70759222b1842A7c72215F64C7FdE8Db24856',
    },
    lusd: {
      liquity: '0x55c75414F525Ef9ccbb8105Ce083EDbDA0075FB5',
    },
    weth: {
      vesper: '0xB642eb5Faf7e731Ff62823515b3fF82B45d385bC',
    }
  },
  transmuter: {
    wausd: '0x219de705e6c22d6fbc27446161efcc7d5d055ecb',
    wabtc: '0x68e91DF501ab66A0796d0fd164B907Acf5f89AD0',
    walusd: '0xB208dec45eDBD1179d9e275C5D459E6282d606ea',
    waeth: '0x7Ee64F74792c307446CD92D23E551EfAE3172A28',
  },
  stakingPoolsV4: '0x47e3492439528fEF29bc5Da55Aa49ED0EFA15c6E',
  stakingPools: '0x0EdA8090E9A86668484915e5E1856E83480FA010',
  wasabiWETHLp: '0x8f9ef75cd6e610dd8acf8611c344573032fb9c3d',
  waUSD3CRV: '0x9f6664205988c3bf4b12b851c075102714869535',
  votingEscrow: '0xb938D8cBF7fc6455d1f2ebeDE5FF9A8e887493B2',
}

const vaults = [
  {
    token: tokens.dai,
    pools: [
      contracts.vault.dai.yearn,
      contracts.vault.dai.idle,
      contracts.vault.dai.pickle,
    ]
  },
  {
    token: tokens.wbtc,
    pools: [
      contracts.vault.wbtc.vesper,
    ]
  },
  {
    token: tokens.lusd,
    pools: [
      contracts.vault.lusd.liquity,
    ]
  },
  {
    token: tokens.weth,
    pools: [
      contracts.vault.weth.vesper,
    ]
  }
]

const collectors = [
  {
    token: tokens['dai'],
    pool: contracts.transmuter['wausd']
  },
  {
    token: tokens['wbtc'],
    pool: contracts.transmuter['wabtc']
  },
  {
    token: tokens['weth'],
    pool: contracts.transmuter['waeth']
  },
  {
    token: tokens['lusd'],
    pool: contracts.transmuter['walusd']
  }
]

const contractsPolygon = {
  vault: {
    pusd: {
      polyquity: '0x4A8086416c824b03D682D6bA117f2eC759c4a085',
    }
  },
  transmuter: {
    wapusd: '0xBBB26ccd60d1444280875c2f9F22bD8c910ec2Eb',
  },
  stakingPools: '0x0EdA8090E9A86668484915e5E1856E83480FA010',
  votingEscrow: '0x896e145568624a498c5a909187363AE947631503',
  wasabiUSDCLp: '0x89e110150fb7df2f20cf79201b81877baffc3797',
  wapusdPusdSLp: '0xa982a2a9EbE0623de7350c228fc5335a413AD5C4',
}

const tokensPolygon = {
  wasabi: '0xc2db4c131ADaF01c15a1DB654c040c8578929D55',
  usdc: ADDRESSES.polygon.USDC,
  pusd: '0x9af3b7dc29d3c4b1a5731408b6a9656fa7ac3b72',
  wapusd: '0x3d244d67D680CaDcccf34F8F996CEA777B6d9FFE',
}

const vaultsPolygon = [
  {
    token: tokensPolygon.pusd,
    pools: [
      contractsPolygon.vault.pusd.polyquity
    ]
  }
]

const collectorsPolygon = [
  {
    token: tokensPolygon['pusd'],
    pool: contractsPolygon.transmuter['wapusd']
  },
]


async function eth(api) {
  await api.sumTokens({
    owners: [contracts.stakingPools, contracts.stakingPoolsV4], tokens: [
      tokens.dai,
      tokens.crv,
      tokens.wbtc,
      tokens.lusd,
      tokens.weth
    ]
  })

  // vaults
  await addVaults(api, vaults)

  const toa = collectors.map(c => [c.token, c.pool])
  return api.sumTokens({ tokensAndOwners: toa, })
}

async function addVaults(api, vaults) {
  let vaultCalls = []
  let _tokens = []

  for (let vault of vaults) {
    let token = vault.token
    let pools = vault.pools

    for (let pool of pools) {
      vaultCalls.push(pool)
      _tokens.push(token)
    }
  }

  const vaultBals = await api.multiCall({ calls: vaultCalls, abi: abi['totalDeposited'] })
  api.add(_tokens, vaultBals)

}

const contractsBSC = {
  vault: {
    busd: {
      alpaca: '0x84e6Fd3595010Aa6eE461EA2BFFA03776780F412',
    }
  },
  transmuter: {
    wabusd: '0x99b399B4c79B8c51C4bc8c0Df4f49A77Cfdec340',
  },
  stakingPools: '0x894CcdBED28E294482fECf10eAC5962148bf4E15',
  votingEscrow: '0x7d487Aeaf197691aA5645728c54f204be67991fF',
  wasabiWBNBLp: '0x4af56f065fab006721ab686086be206eba9d1abc',
  wabusdBusdLp: '0x83a21c7E760F3682AB84D7A25dE79500B76bb908',
}

const tokensBSC = {
  wasabi: '0x86e73212002f80c57070efad4765ff0117de5aea',
  wbnb: ADDRESSES.bsc.WBNB,
  wabusd: '0x6D897D9C0902aC9399fFF708d1c201396342c80C',
  busd: ADDRESSES.bsc.BUSD,
}

const vaultsBSC = [
  {
    token: tokensBSC.busd,
    pools: [contractsBSC.vault.busd.alpaca]
  }
]

const collectorsBSC = [
  {
    token: tokensBSC['busd'],
    pool: contractsBSC.transmuter['wabusd']
  },
]

async function bsc(api) {
  await api.sumTokens({ owner: contractsBSC.stakingPools, tokens: [tokensBSC.busd,] })
  await addVaults(api, vaultsBSC)
  const toa = collectorsBSC.map(c => [c.token, c.pool])
  return api.sumTokens({ tokensAndOwners: toa, })
}

async function polygon(api) {
  await api.sumTokens({ owner: contractsPolygon.stakingPools, tokens: [tokensPolygon.pusd,] })
  await addVaults(api, vaultsPolygon)
  const toa = collectorsPolygon.map(c => [c.token, c.pool])
  return api.sumTokens({ tokensAndOwners: toa, })
}

module.exports = {
  ethereum: {
    tvl: eth,
    staking: stakings([contracts.votingEscrow, contracts.stakingPools], tokens.wasabi),
    pool2: pool2s([
      contracts.stakingPools,
      contracts.stakingPoolsV4,
    ], [contracts.wasabiWETHLp]),
  },
  bsc: {
    tvl: bsc,
    staking: stakings([contractsBSC.votingEscrow], tokensBSC.wasabi),
    pool2: pool2s([
      contractsBSC.stakingPools,
    ], [contractsBSC.wasabiWBNBLp, contractsBSC.wabusdBusdLp]),
  },
  polygon: {
    tvl: polygon,
    staking: stakings([contractsPolygon.votingEscrow], tokensPolygon.wasabi),
    pool2: pool2s([
      contractsPolygon.stakingPools,
    ], [contractsPolygon.wasabiUSDCLp, contractsPolygon.wapusdPusdSLp],),
  },
}