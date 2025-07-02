const abi = require('./abi.json')
const { sumTokens2, PANCAKE_NFT_ADDRESS } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http');

const STRATEGIES_ENDPOINT = 'https://api.stakedao.org/api/strategies';
const LOCKERS_ENDPOINT = 'https://api.stakedao.org/api/lockers';
const PANCAKESWAP_MASTERCHEF_V3 = '0x556B9306565093C855AEA9AE92A594704c2Cd59e'

const LOCKERS = {
  curve: {
    1: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
    42161: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6'
  },
  balancer: {
    1: '0xea79d1A83Da6DB43a85942767C389fE0ACf336A5'
  },
  pendle: {
    1: '0xD8fa8dC5aDeC503AcC5e026a98F32Ca5C1Fa289A'
  },
  yearn: {
    1: '0xF750162fD81F9a436d74d737EF6eE8FC08e98220'
  },
  pancakeswap: {
    1: '0xB7F79090190c297F59A2b7D51D3AEF7AAd0e9Af3',
    56: '0x1e6f87a9ddf744af31157d8daa1e3025648d042d',
    42161: '0xE5244b1A263ce45CF1E51DfA97469711E9bAD68d',
  }
}


async function getLPStrategiesMainnet(timestamp, block) {
  const resp = await Promise.all([
    getConfig('sakedao/eth-curve', `${STRATEGIES_ENDPOINT}/curve/1.json`),
    getConfig('sakedao/eth-balancer', `${STRATEGIES_ENDPOINT}/balancer/1.json`),
    getConfig('sakedao/eth-pendle', `${STRATEGIES_ENDPOINT}/pendle/1.json`),
    getConfig('sakedao/eth-yearn', `${STRATEGIES_ENDPOINT}/yearn/1.json`),
  ]);

  const curveStrats = resp[0].deployed.map((strat) => [strat.gaugeAddress, LOCKERS.curve[1]])
  const balancerStrats = resp[1].deployed.map((strat) => [strat.gaugeAddress, LOCKERS.balancer[1]])
  const pendleStrats = resp[2].deployed.map((strat) => [strat.lpToken.address, LOCKERS.pendle[1]])
  const yearnStrats = resp[3].deployed.map((strat) => [strat.gaugeAddress, LOCKERS.yearn[1]])

  return [...curveStrats, ...balancerStrats, ...pendleStrats, ...yearnStrats]
}

async function tvl(api) {
  let vaults = [
    '0xB17640796e4c27a39AF51887aff3F8DC0daF9567', // crv3_vault_v2 
    '0xCD6997334867728ba14d7922f72c893fcee70e84', // eurs_vault_v2 
    '0x5af15DA84A4a6EDf2d9FA6720De921E1026E37b7', // frax_vault_v2 
    '0x99780beAdd209cc3c7282536883Ef58f4ff4E52F', // frax_vault2_v2 
    '0xa2761B0539374EB7AF2155f76eb09864af075250', // eth_vault_v2 
    '0xbC10c4F7B9FE0B305e8639B04c536633A3dB7065', // steth_vault_v2 
  ]
  await api.erc4626Sum({ calls: vaults })

  const strategies = await getLPStrategiesMainnet()

  const resp = (await get(LOCKERS_ENDPOINT)).parsed

  let lockersInfos = resp.filter((locker) => locker.chainId === 1).map((locker) => ({ contract: `${locker.modules.locker}`, veToken: `${locker.modules.veToken}`, token: `${locker.token.address}` }))

  // To deal with special vePendle case
  const vePendle = '0x4f30A9D41B80ecC5B94306AB4364951AE3170210'
  const veMAV = '0x4949Ac21d5b2A0cCd303C20425eeb29DCcba66D8'.toLowerCase()
  const calls = []
  const callsPendle = []
  const callsMAV = []
  for (let i = 0; i < lockersInfos.length; ++i) {
    if (lockersInfos[i].veToken == vePendle) {
      callsPendle.push({
        target: lockersInfos[i].veToken,
        params: lockersInfos[i].contract
      })
    } else if (lockersInfos[i].veToken.toLowerCase() == veMAV) {
      callsMAV.push({
        veToken: lockersInfos[i].veToken,
        contract: lockersInfos[i].contract
      })
    } else {
      calls.push({
        target: lockersInfos[i].veToken,
        params: lockersInfos[i].contract
      })
    }
  }

  let lockerBals = await api.multiCall({ abi: abi.locked, calls })
  let lockerPendleBal = await api.multiCall({ abi: 'function positionData(address arg0) view returns (uint128 amount, uint128 end)', calls: callsPendle })
  let lockerMAVBal = []

  for (const { contract, veToken } of callsMAV) {
    const count = await api.call({ abi: 'function lockupCount(address) view returns (uint256)', target: veToken, params: contract })
    let balance = 0
    for (let i = 0; i < count; i++) {
      const lockup = await api.call({ abi: 'function lockups(address,uint256) view returns (uint256 amount, uint256 end, uint256 points)', target: veToken, params: [contract, i] })
      balance += +lockup.amount.toString()
    }
    lockerMAVBal.push({ amount: balance, end: 0 })
  }

  for (let i = 0; i < lockersInfos.length; ++i) {
    let amount;
    if (lockersInfos[i].veToken == vePendle) {
      amount = lockerPendleBal.shift().amount
    } else if (lockersInfos[i].veToken.toLowerCase() == veMAV) {
      amount = lockerMAVBal.shift().amount
    } else {
      amount = lockerBals.shift().amount
    }
    api.add(lockersInfos[i].token, amount)
  }

  return sumTokens2({
    api,
    tokensAndOwners: strategies,
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, LOCKERS.pancakeswap[1]]],
    uniV3ExtraConfig: { nftIdFetcher: PANCAKESWAP_MASTERCHEF_V3 }
  })
}

async function staking(api) {
  const sanctuary = '0xaC14864ce5A98aF3248Ffbf549441b04421247D3'
  const arbStrat = '0x20D1b558Ef44a6e23D9BF4bf8Db1653626e642c3'
  const veSdt = '0x0C30476f66034E11782938DF8e4384970B6c9e8a'
  const sdtToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'
  return sumTokens2({
    api,
    owners: [sanctuary, arbStrat, veSdt,],
    tokens: [sdtToken]
  })
}

async function polygon(api) {
  return api.erc4626Sum({ calls: ['0x7d60F21072b585351dFd5E8b17109458D97ec120'] })
}

async function avax(api) {
  return api.erc4626Sum({ calls: ['0x0665eF3556520B21368754Fb644eD3ebF1993AD4'] })
}

async function addPancakeSwapLPStrategiesBsc(api) {
  const resp = await Promise.all([
    getConfig('stakedao/bsc-cake', `${STRATEGIES_ENDPOINT}/pancakeswap/56.json`),
  ]);

  const strats = resp[0].deployed.filter((strat) => strat.version !== '3')
  const deposits = await api.multiCall({ abi: 'uint256:totalSupply', calls: strats.map((strat) => strat.sdGauge.address) })
  const stableStrats = []
  const defaultStrats = []
  strats.forEach((strat, i) => {
    strat.deposits = deposits[i]
    switch (strat.version) {
      case 'stable': stableStrats.push(strat); break
      case '2': api.add(strat.lpToken.address, deposits[i]); break
      default: defaultStrats.push(strat)
    }
  })

  const stableLPsupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: stableStrats.map((strat) => strat.lpToken.address) })
  const stableToken0Bals = await api.multiCall({ abi: 'function balances(uint256) view returns(uint256)', calls: stableStrats.map((strat) => ({ target: strat.pool, params: 0})) })
  const stableToken1Bals = await api.multiCall({ abi: 'function balances(uint256) view returns(uint256)', calls: stableStrats.map((strat) => ({ target: strat.pool, params: 1})) })
  stableStrats.forEach((strat, i) => {
    const ratio =  strat.deposits / stableLPsupplies[i]
    api.add(strat.coins[0].address, ratio * stableToken0Bals[i])
    api.add(strat.coins[1].address, ratio * stableToken1Bals[i])
  })

  const dGauges = defaultStrats.map(i => i.gaugeAddress)
  const dLpTokens = defaultStrats.map(i => i.lpToken.address)
  const adapterAddress = await api.multiCall({  abi: 'address:adapterAddr', calls: dGauges})
  const tokenPerShares = await api.multiCall({ abi: 'function tokenPerShare() view returns(uint256 _token0PerShare, uint256 _token1PerShare)', calls: adapterAddress })
  const dLpSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: dLpTokens })

  defaultStrats.forEach((strat, i) => {
    const ratio = strat.deposits / dLpSupplies[i]
    api.add(strat.coins[0].address, ratio * tokenPerShares[i]._token0PerShare)
    api.add(strat.coins[1].address, ratio * tokenPerShares[i]._token1PerShare)
  })
}

async function bsc(api) {
  // CAKE LOCKER
  const VE_CAKE = '0x5692DB8177a81A6c6afc8084C2976C9933EC1bAB'

  const cakeLock = await api.multiCall({ abi: abi.locks, calls: [{ target: VE_CAKE, params: LOCKERS.pancakeswap[56] }] })
  api.add('0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', cakeLock[0].amount)


  // PANCAKE LP STRATEGIES
  await addPancakeSwapLPStrategiesBsc(api)

  // PANCAKE NFT STRATEGIES
  return sumTokens2({
    api,
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, LOCKERS.pancakeswap[56]]],
    uniV3ExtraConfig: { nftIdFetcher: PANCAKESWAP_MASTERCHEF_V3 },
    resolveLP: true,
  })
}

async function getLPStrategiesArbitrum(timestamp, block) {
  const resp = await Promise.all([
    getConfig('sakedao/arb-curve', `${STRATEGIES_ENDPOINT}/curve/42161.json`),
  ]);

  const stratsCurve = resp[0].deployed.map((strat) => [strat.gaugeAddress, LOCKERS.curve[42161]])

  return [...stratsCurve]
}

async function arbitrum(api) {
  const strategies = await getLPStrategiesArbitrum()
  const PANCAKESWAP_MASTERCHEF_V3_ARBITRUM = '0x5e09ACf80C0296740eC5d6F643005a4ef8DaA694'
  return sumTokens2({
    api,
    tokensAndOwners: strategies,
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, LOCKERS.pancakeswap[42161]]],
    uniV3ExtraConfig: { nftIdFetcher: PANCAKESWAP_MASTERCHEF_V3_ARBITRUM }
  })
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl,
    staking,
  },
  polygon: {
    tvl: polygon,
  },
  avax: {
    tvl: avax,
  },
  bsc: {
    tvl: bsc,
  },
  arbitrum: {
    tvl: arbitrum
  }
}