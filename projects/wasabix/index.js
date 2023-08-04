const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens } = require("../helper/unwrapLPs")
const { stakings } = require('../helper/staking')
const { pool2s } = require('../helper/pool2')

const tokens = {
  dai: {
    token:'DAI',
    address:ADDRESSES.ethereum.DAI,
    decimals:18,
    correspondingMintableToken: 'waUSD'
  },
  wausd: {
    token:'waUSD',
    address:'0xc2db4c131adaf01c15a1db654c040c8578929d55',
    decimals:18,
    baseToken: 'DAI'
  },
  wbtc: {
    token:'wBTC',
    address:ADDRESSES.ethereum.WBTC,
    decimals:8,
    correspondingMintableToken: 'waBTC'
  },
  lusd: {
    token:'LUSD',
    address:ADDRESSES.ethereum.LUSD,
    decimals:18,
    correspondingMintableToken: 'waLUSD'
  },
  walusd: {
    token:'waLUSD',
    address:'0xcbf335Bb8eE86A5A88bEbCda4506a665aA8d7022',
    decimals:18,
    baseToken: 'LUSD'
  },
  wabtc: {
    token:'waBTC',
    address:'0xfd8e70e83e399307db3978d3f34b060a06792c36',
    decimals:8,
    baseToken: 'wBTC'
  },
  wasabi: {
    token:'WASABI',
    address:'0x896e145568624a498c5a909187363AE947631503',
    decimals:18
  },
  weth: {
    token:'WETH',
    address:ADDRESSES.ethereum.WETH,
    decimals:18,
    correspondingMintableToken: 'waETH'
  },
  waeth: {
    token:'waETH',
    address:'0x6a1fbefdF67445C7F531b4F3e04Ffb37b7b13794',
    decimals:18,
    baseToken: 'WETH'
  },
  crv: {
    token:'crv',
    address:'0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    decimals:18
  },
  usdc: {
    token: 'usdc',
    address: ADDRESSES.ethereum.USDC,
    decimals: 6
  }
}

const contracts = {
  vault: {
    dai: {
      yearn: {
        address: '0x5cefb9f7c53a1b0c78e239b2445ddd2d362b7076'
      },
      idle: {
        address: '0x894CcdBED28E294482fECf10eAC5962148bf4E15'
      },
      pickle: {
        address: '0x2de9441c3e22725474146450fc3467a2c778040f'
      }
    },
    wbtc: {
      vesper: {
        address: '0x26a70759222b1842A7c72215F64C7FdE8Db24856'
      }
    },
    lusd: {
      liquity: {
        address: '0x55c75414F525Ef9ccbb8105Ce083EDbDA0075FB5'
      }
    },
    weth: {
      vesper: {
        address: '0xB642eb5Faf7e731Ff62823515b3fF82B45d385bC'
      }
    }
  },
  transmuter: {
    wausd: {
      address: '0x219de705e6c22d6fbc27446161efcc7d5d055ecb'
    },
    wabtc: {
      address: '0x68e91DF501ab66A0796d0fd164B907Acf5f89AD0'
    },
    walusd: {
      address: '0xB208dec45eDBD1179d9e275C5D459E6282d606ea'
    },
    waeth: {
      address: '0x7Ee64F74792c307446CD92D23E551EfAE3172A28'
    }
  },
  stakingPoolsV4: {
    address: '0x47e3492439528fEF29bc5Da55Aa49ED0EFA15c6E'
  },
  stakingPools: {
    address: '0x0EdA8090E9A86668484915e5E1856E83480FA010'
  },
  wasabiWETHLp: {
    address: '0x8f9ef75cd6e610dd8acf8611c344573032fb9c3d'
  },
  waUSD3CRV: {
    address: '0x9f6664205988c3bf4b12b851c075102714869535'
  },
  votingEscrow: {
    address: '0xb938D8cBF7fc6455d1f2ebeDE5FF9A8e887493B2',
  }
}

const vaults = [
  { 
    name: 'dai',
    token: tokens.dai.address,
    pools: [
      {name: 'yearn', address: contracts.vault.dai.yearn.address},
      {name: 'idle', address: contracts.vault.dai.idle.address},
      {name: 'pickle', address: contracts.vault.dai.pickle.address}
    ]
  },
  { 
    name: 'wbtc',
    token: tokens.wbtc.address,
    pools: [
      {name: 'vesper', address: contracts.vault.wbtc.vesper.address}
    ]
  },
  { 
    name: 'lusd',
    token: tokens.lusd.address,
    pools: [
      {name: 'liquity', address: contracts.vault.lusd.liquity.address}
    ]
  },
  { 
    name: 'weth',
    token: tokens.weth.address,
    pools: [
      {name: 'vesper', address: contracts.vault.weth.vesper.address}
    ]
  }
]

const collectors = [
  {
    name: 'wausd',
    token: tokens['dai'].address,
    pool: contracts.transmuter['wausd'].address
  },
  {
    name: 'wabtc',
    token: tokens['wbtc'].address,
    pool: contracts.transmuter['wabtc'].address
  },
  {
    name: 'waeth',
    token: tokens['weth'].address,
    pool: contracts.transmuter['waeth'].address
  },
  {
    name: 'walusd',
    token: tokens['lusd'].address,
    pool: contracts.transmuter['walusd'].address
  }
]

const contractsPolygon = {
  vault: {
    pusd: {
      polyquity: {
        address: '0x4A8086416c824b03D682D6bA117f2eC759c4a085'
      }
    }
  },
  transmuter: {
    wapusd: {
      address: '0xBBB26ccd60d1444280875c2f9F22bD8c910ec2Eb'
    }
  },
  stakingPools: {
    address: '0x0EdA8090E9A86668484915e5E1856E83480FA010'
  },
  votingEscrow: {
    address: '0x896e145568624a498c5a909187363AE947631503',
  },
  wasabiUSDCLp: {
    address: '0x89e110150fb7df2f20cf79201b81877baffc3797'
  },
  wapusdPusdSLp: {
    address: '0xa982a2a9EbE0623de7350c228fc5335a413AD5C4'
  }
}

const tokensPolygon = {
  wasabi: {
    token: 'WASABI',
    address: '0xc2db4c131ADaF01c15a1DB654c040c8578929D55',
    decimals: 18
  },
  usdc: {
    token: 'USDC',
    address: ADDRESSES.polygon.USDC,
    decimals: 6,
  },
  pusd: {
    token: 'PUSD',
    address: '0x9af3b7dc29d3c4b1a5731408b6a9656fa7ac3b72',
    decimals: 18,
  },
  wapusd: {
    token: 'waPUSD',
    address: '0x3d244d67D680CaDcccf34F8F996CEA777B6d9FFE',
    decimals: 18,
  }
}

const vaultsPolygon = [
  { 
    name: 'pusd',
    token: tokensPolygon.pusd.address,
    pools: [
      {name: 'polyquity', address: contractsPolygon.vault.pusd.polyquity.address},
    ]
  }
]

const collectorsPolygon = [
  {
    name: 'wapusd',
    token: tokensPolygon['pusd'].address,
    pool: contractsPolygon.transmuter['wapusd'].address
  },
]

async function eth(timestamp, block) {
    let balances = {};

    const ethBlock = block

    await sumTokens(balances, [
      tokens.dai.address,
      tokens.crv.address,
      tokens.wbtc.address,
      tokens.lusd.address,
      tokens.weth.address
    ].map(t => [t, contracts.stakingPools.address]), block)


    await sumTokens(balances, [
      tokens.dai.address,
      tokens.crv.address,
      tokens.wbtc.address,
      tokens.lusd.address,
      tokens.weth.address
    ].map(t => [t, contracts.stakingPoolsV4.address]), block)
   
    // vaults

    let vaultCalls = []

    for (let vault of vaults) {
        let token = vault.token
        let pools = vault.pools

        for(let pool of pools) {
          vaultCalls.push({target: pool.address, token: token})
        }
    }

    const vaultsInfo = await sdk.api.abi.multiCall({
      calls: vaultCalls,
      abi: abi['totalDeposited']
    })

    sdk.util.sumMultiBalanceOf(balances, vaultsInfo)

    const toa = collectors.map(c => [c.token, c.pool])
    return sumTokens(balances, toa, ethBlock)
}

const contractsBSC = {
  vault: {
    busd: {
      alpaca: {
        address: '0x84e6Fd3595010Aa6eE461EA2BFFA03776780F412'
      }
    }
  },
  transmuter: {
    wabusd: {
      address: '0x99b399B4c79B8c51C4bc8c0Df4f49A77Cfdec340'
    }
  },
  stakingPools: {
    address: '0x894CcdBED28E294482fECf10eAC5962148bf4E15'
  },
  votingEscrow: {
    address: '0x7d487Aeaf197691aA5645728c54f204be67991fF',
  },
  wasabiWBNBLp: {
    address: '0x4af56f065fab006721ab686086be206eba9d1abc'
  },
  wabusdBusdLp: {
    address: '0x83a21c7E760F3682AB84D7A25dE79500B76bb908'
  }
}

const tokensBSC = {
  wasabi: {
    token:'WASABI',
    address:'0x86e73212002f80c57070efad4765ff0117de5aea',
    decimals:18
  },
  wbnb: {
    token:'WBNB',
    address:ADDRESSES.bsc.WBNB,
    decimals:18,
    correspondingMintableToken: 'waBNB'
  },
  wabusd: {
    token: 'waBUSD',
    address: '0x6D897D9C0902aC9399fFF708d1c201396342c80C',
    decimals: 18,
    baseToken: 'BUSD'
  },
  busd: {
    token: 'BUSD',
    address: ADDRESSES.bsc.BUSD,
    decimals: 18,
    correspondingMintableToken: 'waBUSD'
  }
}

const vaultsBSC = [
  { 
    name: 'busd',
    token: tokensBSC.busd.address,
    pools: [
      {name: 'alpaca', address: contractsBSC.vault.busd.alpaca.address},
    ]
  }
]

const collectorsBSC = [
  {
    name: 'wabusd',
    token: tokensBSC['busd'].address,
    pool: contractsBSC.transmuter['wabusd'].address
  },
]

const busd = 'bsc:' + ADDRESSES.bsc.BUSD

async function bsc(timestamp, block, chainBlocks) {
    let balances = {};

    await sumTokens(balances, [
      tokensBSC.busd.address,
    ].map(t => [t, contractsBSC.stakingPools.address]), chainBlocks.bsc, 'bsc')
   

    // vaults
    let vaultTvl = 0
    let vaultCalls = []

    for (let vault of vaultsBSC) {
        let token = vault.token
        let pools = vault.pools

        for(let pool of pools) {
          vaultCalls.push({target: pool.address, token: token})
        }
    }

    const { output: vaultsInfo } = await sdk.api.abi.multiCall({
      calls: vaultCalls,
      abi: abi['totalDeposited'],
      chain: 'bsc',
      block: chainBlocks["bsc"],
    })
    for(let vault of vaultsInfo) {
      let totalDeposited = vault.output
      sdk.util.sumSingleBalance(balances, busd, totalDeposited)
    }

    //collectors
    for(let collector of collectorsBSC) {
      let tokenLocked = await sdk.api.erc20.balanceOf({
          owner: collector.pool,
          target: collector.token,
          chain: 'bsc',
          block: chainBlocks["bsc"],
      });
      let totalDeposited = tokenLocked.output
      sdk.util.sumSingleBalance(balances, busd, totalDeposited)
    }

    return balances
}

async function polygon(timestamp, block, chainBlocks) {
  let balances = {};

  await sumTokens(balances, [
    tokensPolygon.pusd.address,
  ].map(t => [t, contractsPolygon.stakingPools.address]), chainBlocks.polygon, 'polygon')
 
  // vaults
  let vaultCalls = []

  for (let vault of vaultsPolygon) {
      let token = vault.token
      let pools = vault.pools

      for(let pool of pools) {
        vaultCalls.push({target: pool.address, token: token})
      }
  }

  const { output: vaultsInfo } = await sdk.api.abi.multiCall({
    calls: vaultCalls,
    abi: abi['totalDeposited'],
    chain: 'polygon',
    block: chainBlocks["polygon"],
  })

  for(let vault of vaultsInfo) {
    let totalDeposited = vault.output
    sdk.util.sumSingleBalance(balances, busd, totalDeposited)
    // let poolAddr = vault.input.target
    // sdk.util.sumSingleBalance(balances, _.find(vaultCalls, {target: poolAddr}).token, totalDeposited); 
  }

  //collectors

  for(let collector of collectorsPolygon) {
    let tokenLocked = await sdk.api.erc20.balanceOf({
        owner: collector.pool,
        target: collector.token,
        chain: 'polygon',
        block: chainBlocks["polygon"],
        // ethBlock
    });
    let totalDeposited = tokenLocked.output
    sdk.util.sumSingleBalance(balances, busd, totalDeposited)
  }

  return balances
}

module.exports = {
    ethereum:{
        tvl: eth,
        // locker    
        staking: stakings([contracts.votingEscrow.address, contracts.stakingPools.address], tokens.wasabi.address),
        pool2: pool2s([
          contracts.stakingPools.address,
          contracts.stakingPoolsV4.address,
        ], [contracts.wasabiWETHLp.address]),
    },
    bsc:{
        tvl: bsc,
        staking: stakings([contractsBSC.votingEscrow.address], tokensBSC.wasabi.address, 'bsc'),
        pool2: pool2s([
          contractsBSC.stakingPools.address,
        ], [contractsBSC.wasabiWBNBLp.address, contractsBSC.wabusdBusdLp.address], 'bsc'),
    },
    polygon:{
        tvl: polygon,
        staking: stakings([contractsPolygon.votingEscrow.address], tokensPolygon.wasabi.address, 'polygon'),
        pool2: pool2s([
          contractsPolygon.stakingPools.address,
        ], [contractsPolygon.wasabiUSDCLp.address, contractsPolygon.wapusdPusdSLp.address], 'polygon'),
    },
}