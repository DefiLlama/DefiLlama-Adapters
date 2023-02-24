const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs")
const { transformBalances } = require('../helper/portedTokens');
const { getConfig } = require("../helper/cache");

async function getProcolAddresses() {
  return (await getConfig('kalmy-app/bsc',
    'https://raw.githubusercontent.com/kalmar-io/kalmar-assets/main/data/bsc-kalmar-contract.json'
  ))
}

async function getFTMProcolAddresses() {
  return (await getConfig('kalmy-app/fantom',
    'https://raw.githubusercontent.com/kalmar-io/kalmar-assets/main/data/ftm-kalmar-contract.json'
  ))
}

async function getAvaxProcolAddresses() {
  return (await getConfig('kalmy-app/avax',
    'https://raw.githubusercontent.com/kalmar-io/kalmar-assets/main/data/avax-kalmar-contract.json'
  ))
}

function getBSCAddress(address) {
  return `bsc:${address}`
}

function getFTMAddress(address) {
  return `fantom:${address}`
}

function getAvaxAddress(address) {
  return `avax:${address}`
}

async function tvl(timestamp, ethBlock, chainBlocks) {
  /// @dev Initialized variables
  const balances = {}

  /// @dev Getting all addresses from Github
  const addresses = await getProcolAddresses()

  const block = chainBlocks.bsc;

  for(let i = 0; i < addresses['Vaults'].length; i++) {
    /// @dev getting balances that each of workers holding
    const stakingTokenInfos = (await sdk.api.abi.multiCall({
      block,
      abi: abi.userInfo,
      calls: addresses['Vaults'][i]['workers'].map((worker) => {
        return {
          target: worker['stakingTokenAt'],
          params: [worker['pId'], worker['address']]
        }
      }),
      chain: 'bsc'
    })).output

    /// @dev unwrap LP to get underlaying token balances for workers that are working with LPs
    await unwrapUniswapLPs(balances,
      stakingTokenInfos.filter((n) => {
        /// @dev filter only workers that are working with LPs
        const name = addresses['Vaults'][i]['workers'].find((w) => w.address === n.input.params[1]).name
        if(name.includes("CakeMaxiWorker")) {
          return false
        }
        return true
      }).map((info) => {
        /// @dev getting LP address and return the object that unwrapUniswapLPs want
        const lpAddr = addresses['Vaults'][i]['workers'].find((w) => w.address === info.input.params[1]).stakingToken;
        return {
          token: lpAddr,
          balance: info.output.amount
        }
      }
    ), block, 'bsc', (addr) => `bsc:${addr}`)

    /// @dev update balances directly for single-asset workers
    const singleAssetWorkersBalances = stakingTokenInfos.filter((n) => {
      /// @dev filter only single-asset LYF workers
      const name = addresses['Vaults'][i]['workers'].find((w) => w.address === n.input.params[1]).name
      if(name.includes("CakeMaxiWorker")) {
        return true
      }
      return false
    }).map((n) => {
      /// @dev getting staking token address and return the object to be sum with balances
      const stakingTokenAddr = addresses['Vaults'][i]['workers'].find((w) => w.address === n.input.params[1]).stakingToken;
      return {
        token: stakingTokenAddr,
        balance: n.output.amount
      }
    })

    /// @dev sum single-asset balances to balances variable
    singleAssetWorkersBalances.forEach((s) => {
      balances[getBSCAddress(s.token)] = BigNumber(balances[getBSCAddress(s.token)] || 0).plus(BigNumber(s.balance)).toFixed(0)
    })
  }

  /// @dev getting all unused liquidity on each vault
  const unusedBTOKEN = (await sdk.api.abi.multiCall({
    block,
    abi: abi.balanceOf,
    calls: addresses['Vaults'].map((v) => {
      return {
        target: v['baseToken'],
        params: [v['address']]
      }
    }),
    chain: 'bsc'
  })).output

  unusedBTOKEN.forEach((u) => {
    balances[getBSCAddress(u.input.target)] = BigNumber(balances[getBSCAddress(u.input.target)] || 0).plus(BigNumber(u.output)).toFixed(0)
  })

  /// @dev getting unused BNB on iBNB vault
  const vBNB = addresses['Vaults'].filter((v) => v['symbol'] === 'iBNB')[0]  
  const unusedBNB = (await sdk.api.eth.getBalance({
      block,
      target: vBNB['address'],
      chain: 'bsc',
  })).output

  balances[getBSCAddress(vBNB['baseToken'])] = BigNumber(balances[getBSCAddress(vBNB['baseToken'])] || 0).plus(BigNumber(unusedBNB)).toFixed(0)

  /// @dev getting all unused liquidity on each lp staking
  const lpStakingInfos = (await sdk.api.abi.multiCall({
    block,
    abi: abi.balanceOf,
    calls: addresses['Liquidity'].map((s) => {
      return {
        target: s['stakingToken'],
        params: [s['stakingTokenAt']]
      }
    }),
    chain: 'bsc'
  })).output

  /// @dev unwrap LP to get underlaying token balances for lp staking that are working with LPs
  await unwrapUniswapLPs(balances,
    lpStakingInfos.map((info) => {
      /// @dev getting LP address and return the object that unwrapUniswapLPs want
      const lpAddr = info.input.target;
      return {
        token: lpAddr,
        balance: info.output
      }
    }
  ), block, 'bsc', (addr) => `bsc:${addr}`)


  return transformBalances('bsc', balances)
}

async function ftmTvl(timestamp, ethBlock, chainBlocks) {
  /// @dev Initialized variables
  const balances = {}

  /// @dev Getting all addresses from Github
  const addresses = await getFTMProcolAddresses()

  const block = chainBlocks.fantom;

  /// @dev getting all unused liquidity on each lp staking
  const lpStakingInfos = (await sdk.api.abi.multiCall({
    block,
    abi: abi.balanceOf,
    calls: addresses['Liquidity'].map((s) => {
      return {
        target: s['stakingToken'],
        params: [s['stakingTokenAt']]
      }
    }),
    chain: 'fantom'
  })).output

  /// @dev unwrap LP to get underlaying token balances for lp staking that are working with LPs
  await unwrapUniswapLPs(balances,
    lpStakingInfos.map((info) => {
      /// @dev getting LP address and return the object that unwrapUniswapLPs want
      const lpAddr = info.input.target;
      return {
        token: lpAddr,
        balance: info.output
      }
    }
  ), block, 'fantom', (addr) => `fantom:${addr}`)

  return balances
}

async function avaxTvl(timestamp, ethBlock, chainBlocks) {
  /// @dev Initialized variables
  const balances = {}

  /// @dev Getting all addresses from Github
  const addresses = await getAvaxProcolAddresses()

  const block = chainBlocks.avax;

  /// @dev getting all unused liquidity on each lp staking
  const lpStakingInfos = (await sdk.api.abi.multiCall({
    block,
    abi: abi.balanceOf,
    calls: addresses['Liquidity'].map((s) => {
      return {
        target: s['stakingToken'],
        params: [s['stakingTokenAt']]
      }
    }),
    chain: 'avax'
  })).output

  /// @dev unwrap LP to get underlaying token balances for lp staking that are working with LPs
  await unwrapUniswapLPs(balances,
    lpStakingInfos.map((info) => {
      /// @dev getting LP address and return the object that unwrapUniswapLPs want
      const lpAddr = info.input.target;
      return {
        token: lpAddr,
        balance: info.output
      }
    }
  ), block, 'avax', (addr) => `avax:${addr}`)

  return balances
}

async function staking(timestamp, ethBlock, chainBlocks) {
  /// @dev Initialized variables
  const balances = {}

  /// @dev Getting all addresses from Github
  const addresses = await getProcolAddresses()

  const block = chainBlocks.bsc;

  /// @dev getting staking amount on each vault
  const stakingTokens = (await sdk.api.abi.multiCall({
    block,
    abi: abi.balanceOf,
    calls: addresses['Staking'].map((s) => {
      return {
        target: s['stakingToken'],
        params: [s['address']]
      }
    }),
    chain: 'bsc'
  })).output

  /// @dev getting Kalm staking balance
  const kalmObjIndexes = addresses['Staking'].reduce((memo, s, i) => s.name.includes('Kalm') ? [...memo, i] : [...memo], [])
  kalmObjIndexes.forEach((kalmObjIndex) => {
    const kalmToken = addresses['Staking'][kalmObjIndex]['stakingToken']
    const kalmStaked = stakingTokens[kalmObjIndex].output
    balances[getBSCAddress(kalmToken)] = BigNumber(balances[getBSCAddress(kalmToken)] || 0).plus(BigNumber(kalmStaked)).toFixed(0)
  })

  /// @dev getting total base token
  const totalBNB = (await sdk.api.abi.multiCall({
    block,
    abi: abi.totalETH,
    calls: addresses['Staking'].filter((s) => s.name.includes('iBNB')).map((sObj) => {
      return {
        target: sObj['stakingToken']
      }
    }),
    chain: 'bsc'
  })).output

  const totalBEP20 = (await sdk.api.abi.multiCall({
    block,
    abi: abi.totalBEP20,
    calls: addresses['Staking'].filter((s) => !s.name.includes('iBNB') && !s.name.includes('Kalm')).map((sObj) => {
      return {
        target: sObj['stakingToken']
      }
    }),
    chain: 'bsc'
  })).output

  const totalBTOKEN = [...totalBNB, ...totalBEP20]
  const iTokens = addresses['Staking'].filter((s) => !s.name.includes('Kalm'))

  const totalITOKEN = (await sdk.api.abi.multiCall({
    block,
    abi: abi.totalSupply,
    calls: iTokens.map((sObj) => {
      return {
        target: sObj['stakingToken']
      }
    }),
    chain: 'bsc'
  })).output

  const onlyITOKENStaking = stakingTokens.filter((_, i) => !kalmObjIndexes.includes(i))

  totalITOKEN.forEach((t, i) => {
    const tokenPerShare = BigNumber(totalBTOKEN[i].output).div(totalITOKEN[i].output)
    const totalValue = BigNumber(onlyITOKENStaking[i].output).times(tokenPerShare)
    balances[getBSCAddress(iTokens[i]['baseToken'])] = BigNumber(balances[getBSCAddress(iTokens[i]['baseToken'])] || 0).plus(totalValue).toFixed(0)
  })

  return balances
}

async function ftmStaking(timestamp, ethBlock, chainBlocks) {
  /// @dev Initialized variables
  const balances = {}

  /// @dev Getting all addresses from Github
  const addresses = await getFTMProcolAddresses()

  const block = chainBlocks.fantom;

  /// @dev getting staking amount on each vault
  const stakingTokens = (await sdk.api.abi.multiCall({
    block,
    abi: abi.balanceOf,
    calls: addresses['Staking'].map((s) => {
      return {
        target: s['stakingToken'],
        params: [s['address']]
      }
    }),
    chain: 'fantom'
  })).output

  /// @dev getting Kalm staking balance
  const kalmObjIndexes = addresses['Staking'].reduce((memo, s, i) => s.name.includes('Kalm') ? [...memo, i] : [...memo], [])
  kalmObjIndexes.forEach((kalmObjIndex) => {
    const kalmToken = addresses['Staking'][kalmObjIndex]['stakingToken']
    const kalmStaked = stakingTokens[kalmObjIndex].output
    balances[getFTMAddress(kalmToken)] = BigNumber(balances[getFTMAddress(kalmToken)] || 0).plus(BigNumber(kalmStaked)).toFixed(0)
  })

  return balances
}

async function avaxStaking(timestamp, ethBlock, chainBlocks) {
  /// @dev Initialized variables
  const balances = {}

  /// @dev Getting all addresses from Github
  const addresses = await getAvaxProcolAddresses()

  const block = chainBlocks.avax;

  /// @dev getting staking amount on each vault
  const stakingTokens = (await sdk.api.abi.multiCall({
    block,
    abi: abi.balanceOf,
    calls: addresses['Staking'].map((s) => {
      return {
        target: s['stakingToken'],
        params: [s['address']]
      }
    }),
    chain: 'avax'
  })).output

  /// @dev getting Kalm staking balance
  const kalmObjIndexes = addresses['Staking'].reduce((memo, s, i) => s.name.includes('Kalm') ? [...memo, i] : [...memo], [])
  kalmObjIndexes.forEach((kalmObjIndex) => {
    const kalmToken = addresses['Staking'][kalmObjIndex]['stakingToken']
    const kalmStaked = stakingTokens[kalmObjIndex].output
    balances[getAvaxAddress(kalmToken)] = BigNumber(balances[getAvaxAddress(kalmToken)] || 0).plus(BigNumber(kalmStaked)).toFixed(0)
  })

  return balances
}

module.exports = {
  bsc: {
    tvl,
    staking
  },
  fantom: {
    tvl: ftmTvl,
    staking: ftmStaking
  },
  avax: {
    tvl: avaxTvl,
    staking: avaxStaking
  }
};
  