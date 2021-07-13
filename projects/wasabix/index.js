const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const _ = require("lodash");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs")
const utils = require('../helper/utils');
const getReserves = require('../helper/abis/getReserves.json');
const { transformBscAddress } = require('../helper/portedTokens');

const tokens = {
  dai: {
    token:'DAI',
    address:'0x6b175474e89094c44da98b954eedeac495271d0f',
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
    address:'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals:8,
    correspondingMintableToken: 'waBTC'
  },
  lusd: {
    token:'LUSD',
    address:'0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
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
    address:'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
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

async function eth(timestamp, block) {
    let balances = {};

    const ethBlock = block

    // locker
    const wasabiAddr = tokens.wasabi.address
    let tokenStaked = await sdk.api.erc20.balanceOf({
        owner: contracts.votingEscrow.address,
        target: wasabiAddr,
        ethBlock
    });
    sdk.util.sumSingleBalance(balances, wasabiAddr, tokenStaked.output);

    // farm pools
    // 0: wasabi
    // 1: wausd
    // 4: lp
    // 5: 3crv
    // 7: wabtc
    // 8: waLUSD
    // 9: waETH

    const poolIds = [0,1,4,5,7,8,9]
    const poolMapping = {
      0: tokens.wasabi.address,
      1: tokens.dai.address,
      4: contracts.wasabiWETHLp.address,
      5: tokens.crv.address,
      7: tokens.wbtc.address,
      8: tokens.lusd.address,
      9: tokens.weth.address
    } 
    const calls = _.map(poolIds, function(pid) {
      return {target: contracts.stakingPools.address, params: [pid]}
    });
    const { output: poolsInfo } = await sdk.api.abi.multiCall({
      calls: calls,
      abi: abi['getPoolTotalDeposited'],
    })

    for(let pool of poolsInfo) {
      let pid = pool.input.params[0];
      let totalDeposited = pool.output
      
      if(pid != 4) {
        sdk.util.sumSingleBalance(balances, poolMapping[pid], totalDeposited);  
      } 
      else {
        await unwrapUniswapLPs(balances, [{
          token: poolMapping[pid],
          balance: totalDeposited
        }], block)
      }
    }
    
    // vaults

    let vaultCalls = []

    for (let vault of vaults) {
        let token = vault.token
        let pools = vault.pools

        for(let pool of pools) {
          let address = pool.address
          vaultCalls.push({target: pool.address, token: token})
        }
    }

    const { output: vaultsInfo } = await sdk.api.abi.multiCall({
      calls: vaultCalls,
      abi: abi['totalDeposited']
    })

    for(let vault of vaultsInfo) {
      let totalDeposited = vault.output
      let poolAddr = vault.input.target
      sdk.util.sumSingleBalance(balances, _.find(vaultCalls, {target: poolAddr}).token, totalDeposited); 
    }

    //collectors
    for(let collector of collectors) {
      let tokenLocked = await sdk.api.erc20.balanceOf({
          owner: collector.pool,
          target: collector.token,
          ethBlock
      });
      sdk.util.sumSingleBalance(balances, collector.token, tokenLocked.output);
    }
    return balances
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
    address:'0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
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
    address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
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

function getBSCAddress(address) {
    return `bsc:${address}`
}

async function getPrices() {
  const priceTokens = ['wbnb']
  const prices = await utils.getPricesfromString(priceTokens.toString());
  return prices
}

async function getWasabiPrice(wbnbPrice, chainBlocks) {
  return new Promise(async (resolve, reject) => {
    let reserves = await sdk.api.abi.call({
      abi: getReserves,
      target: contractsBSC.wasabiWBNBLp.address,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })

    const wasabiPrice = BigNumber(reserves.output._reserve1).div(BigNumber(reserves.output._reserve0)).times(BigNumber(wbnbPrice))
    resolve(wasabiPrice)
  });
}

async function bsc(timestamp, block, chainBlocks) {
    let balances = {};
    let tvl = 0;

    //locker
    const wasabiAddr = tokensBSC.wasabi.address
    const tokenStaked = await sdk.api.erc20.balanceOf({
        owner: contractsBSC.votingEscrow.address,
        target: wasabiAddr,
        chain: 'bsc',
        block: chainBlocks["bsc"],
    });
    
    // sdk.util.sumSingleBalance(balances, getBSCAddress(wasabiAddr), tokenStaked.output);

    const prices = await getPrices()
    const wasabiPrice = await getWasabiPrice(prices.data.wbnb.usd, chainBlocks)
    const lockerTvl = BigNumber(tokenStaked.output).div(Math.pow(10, 18)) * wasabiPrice

    tvl += lockerTvl

    // farm pools
    // pool 0 (WASABI-BNB PLP)
    // pool 1 (waBUSD)
    // pool 2 (waBUSD-BUSD PLP)

    const poolIds = [0,1,2]
    const poolMapping = {
      0: contractsBSC.wasabiWBNBLp.address,
      1: tokensBSC.busd.address,
      2: tokensBSC.busd.address,
    } 
    const calls = _.map(poolIds, function(pid) {
      return {target: contractsBSC.stakingPools.address, params: [pid]}
    });
    const { output: poolsInfo } = await sdk.api.abi.multiCall({
      calls: calls,
      abi: abi['poolInfo'],
      chain: 'bsc',
      block: chainBlocks["bsc"],
    })

    const transformAdress = await transformBscAddress()

    let poolTvl = 0
    for(let pool of poolsInfo) {
      let pid = pool.input.params[0];
      let totalDeposited = pool.output[5]

      // if(pid != 0) {
      //   sdk.util.sumSingleBalance(balances, transformAdress(poolMapping[pid]), totalDeposited);  
      // } 
      // else {
      //   await unwrapUniswapLPs(balances, [{
      //     token: poolMapping[pid],
      //     balance: totalDeposited
      //   }], chainBlocks["bsc"], 'bsc', transformAdress)
      // }

      if(pid == 0) {
        let lpBalances = {}
        await unwrapUniswapLPs(lpBalances, [{
          token: poolMapping[pid],
          balance: totalDeposited
        }], chainBlocks["bsc"], 'bsc', transformAdress)

        const wbnbDeposited = lpBalances[getBSCAddress(tokensBSC.wbnb.address)]
        
        poolTvl += BigNumber(wbnbDeposited).div(Math.pow(10, 18)).toNumber() * prices.data.wbnb.usd * 2
      }
      else if (pid == 1) {
        poolTvl += BigNumber(totalDeposited).div(Math.pow(10, 18)).toNumber()
      }
      else if (pid == 2){
        poolTvl += BigNumber(totalDeposited*2).div(Math.pow(10, 18)).toNumber()
      }
    }

    // console.log('poolTvl', poolTvl)
    tvl += poolTvl
    
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
      vaultTvl += BigNumber(totalDeposited).div(Math.pow(10, 18)).toNumber()
      // let poolAddr = vault.input.target
      // sdk.util.sumSingleBalance(balances, _.find(vaultCalls, {target: poolAddr}).token, totalDeposited); 
    }

    // console.log('vaultTvl', vaultTvl)
    tvl += vaultTvl

    //collectors
    let collectorTvl = 0

    for(let collector of collectorsBSC) {
      let tokenLocked = await sdk.api.erc20.balanceOf({
          owner: collector.pool,
          target: collector.token,
          chain: 'bsc',
          block: chainBlocks["bsc"],
          // ethBlock
      });
      let totalDeposited = tokenLocked.output
      collectorTvl += BigNumber(totalDeposited).div(Math.pow(10, 18)).toNumber()
      // sdk.util.sumSingleBalance(balances, collector.token, tokenLocked.output);
    }
    // console.log('collectorTvl', collectorTvl)
    tvl += collectorTvl

    console.log('bsc tvl', tvl)

    return {
      [getBSCAddress(tokensBSC.busd.address)]: BigNumber(tvl)
        .multipliedBy(10 ** 18)
        .toFixed(0),
    };
}

module.exports = {
    ethereum:{
        tvl: eth
    },
    bsc:{
        tvl: bsc
    },
    tvl: sdk.util.sumChainTvls([eth,bsc])
}