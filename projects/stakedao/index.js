const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const abi = require('./abi.json')
const { sumTokens2, PANCAKE_NFT_ADDRESS } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http');

const STRATEGIES_ENDPOINT = 'https://api.stakedao.org/api/strategies';
const LOCKERS_ENDPOINT = 'https://api.stakedao.org/api/lockers';
const PANCAKESWAP_MASTERCHEF_V3 = '0x556B9306565093C855AEA9AE92A594704c2Cd59e'

const LOCKERS = {
  curve : {
    1 : '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
    42161 : '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6'
  },
  balancer : {
    1 : '0xea79d1A83Da6DB43a85942767C389fE0ACf336A5'
  },
  pendle : {
    1 : '0xD8fa8dC5aDeC503AcC5e026a98F32Ca5C1Fa289A'
  },
  yearn : {
    1 : '0xF750162fD81F9a436d74d737EF6eE8FC08e98220'
  },
  pancakeswap : {
    1: '0xB7F79090190c297F59A2b7D51D3AEF7AAd0e9Af3',
    56: '0x1e6f87a9ddf744af31157d8daa1e3025648d042d',
    42161: '0xE5244b1A263ce45CF1E51DfA97469711E9bAD68d',
  }
}

// ----------------------------------- ETHEREUM ----------------------------------- //

async function getLPStrategiesMainnet(timestamp, block) {
  const resp = await Promise.all([
    get(`${STRATEGIES_ENDPOINT}/curve/1.json`),
    get(`${STRATEGIES_ENDPOINT}/balancer/1.json`),
    get(`${STRATEGIES_ENDPOINT}/pendle/1.json`),
    get(`${STRATEGIES_ENDPOINT}/yearn/1.json`),
  ]);

  const curveStrats = resp[0].deployed.map((strat) => [strat.gaugeAddress, LOCKERS.curve[1]])
  const balancerStrats = resp[1].deployed.map((strat) => [strat.gaugeAddress, LOCKERS.balancer[1]])
  const pendleStrats = resp[2].deployed.map((strat) => [strat.lpToken.address, LOCKERS.pendle[1]])
  const yearnStrats = resp[3].deployed.map((strat) => [strat.gaugeAddress, LOCKERS.yearn[1]])

  return [...curveStrats, ...balancerStrats, ...pendleStrats, ...yearnStrats]
}

async function tvl(api) {
  let balances = {}
  /////////////////////////////////////////////////////////////////////
  // --- STRATEGIES V2 
  /////////////////////////////////////////////////////////////////////
  // ==== Addresses ==== //
  const crv3_vault_v2 = {
    contract: '0xB17640796e4c27a39AF51887aff3F8DC0daF9567',
    token: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  }
  const eurs_vault_v2 = {
    contract: '0xCD6997334867728ba14d7922f72c893fcee70e84',
    token: '0x194eBd173F6cDacE046C53eACcE9B953F28411d1',
  }
  const frax_vault_v2 = {
    contract: '0x5af15DA84A4a6EDf2d9FA6720De921E1026E37b7',
    token: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
  }
  const frax_vault2_v2 = {
    contract: '0x99780beAdd209cc3c7282536883Ef58f4ff4E52F',
    token: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
  }
  const eth_vault_v2 = {
    contract: '0xa2761B0539374EB7AF2155f76eb09864af075250',
    token: '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c',
  }
  const steth_vault_v2 = {
    contract: '0xbC10c4F7B9FE0B305e8639B04c536633A3dB7065',
    token: '0x06325440D014e39736583c165C2963BA99fAf14E',
  }
  let vaults = [
    crv3_vault_v2,
    eurs_vault_v2,
    frax_vault_v2,
    frax_vault2_v2,
    eth_vault_v2,
    steth_vault_v2
  ]
  const vaultBals = await api.multiCall({
    abi: abi['balance'],
    calls: vaults.map(i => i.contract),
  })
  vaultBals.forEach((bal, i) => sdk.util.sumSingleBalance(balances, vaults[i].token, bal))

  /////////////////////////////////////////////////////////////////////
  // --- LP Strategies
  /////////////////////////////////////////////////////////////////////
  const strategies = await getLPStrategiesMainnet()

  /////////////////////////////////////////////////////////////////////
  // --- LIQUID LOCKERS
  /////////////////////////////////////////////////////////////////////
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
    const count = await api.call({  abi: 'function lockupCount(address) view returns (uint256)', target: veToken, params: contract })
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
    }  else {
      amount = lockerBals.shift().amount
    }
    sdk.util.sumSingleBalance(balances, lockersInfos[i].token, amount)
  }


  return sumTokens2({ 
    api, 
    tokensAndOwners: strategies, 
    balances, 
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, LOCKERS.pancakeswap[1]]],
    uniV3ExtraConfig: { nftIdFetcher: PANCAKESWAP_MASTERCHEF_V3 }
  })
}

async function staking(timestamp, block) {
  const sanctuary = '0xaC14864ce5A98aF3248Ffbf549441b04421247D3'
  const arbStrat = '0x20D1b558Ef44a6e23D9BF4bf8Db1653626e642c3'
  const veSdt = '0x0C30476f66034E11782938DF8e4384970B6c9e8a'
  const sdtToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'
  return sumTokens2({
    owners: [sanctuary, arbStrat, veSdt,],
    tokens: [sdtToken]
  })
}

// ----------------------------------- POLYGON ----------------------------------- //

async function polygon(api) {
  return getBalances(api, [{contract: '0x7d60F21072b585351dFd5E8b17109458D97ec120'}])
}

// ----------------------------------- AVALANCHE ----------------------------------- //

async function getBalances(api, vaults, { balances = {} } = {}) {
  const tokens = await api.multiCall({ abi: 'address:token', calls: vaults.map(i => i.contract) })
  const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults.map(i => i.contract) })
  tokens.forEach((token, i) => sdk.util.sumSingleBalance(balances, token, bals[i], api.chain))
  return balances
}

async function avax(api) {
  const crv_3crv_vault_avalanche = {
    contract: '0x0665eF3556520B21368754Fb644eD3ebF1993AD4',
  }

  const vaultsAvalanche = [
    crv_3crv_vault_avalanche
  ]
  return getBalances(api, vaultsAvalanche)
}

// ----------------------------------- BINANCE SMART CHAIN -----------------------------------

async function addPancakeSwapLPStrategiesBsc(api) {
  const resp = await Promise.all([
    get(`${STRATEGIES_ENDPOINT}/pancakeswap/56.json`),
  ]);

  const strats = resp[0].deployed.filter((strat) => strat.version !== '3')
  for (const strat of strats){
    const deposits = await api.call({abi : 'function totalSupply() view returns (uint256)', target: strat.sdGauge.address})

    switch (strat.version) {
      case 'stable': {
        const token_balances = await api.multiCall({ abi: 'function balances(uint256) view returns(uint256)', calls: [0, 1], target: strat.pool })
        const totalSupply = await api.call({ abi: 'function totalSupply() view returns (uint256)', target: strat.lpToken.address, })
        
        api.add(strat.coins[0].address, deposits * token_balances[0] / totalSupply)
        api.add(strat.coins[1].address, deposits * token_balances[1] / totalSupply)
        break
      }
      case '2': {
        const balances = await api.call({ abi: 'function getReserves() view returns(uint112 _reserve0 ,uint112 _reserve1,uint32 _blockTimestampLast)', target: strat.lpToken.address, })
        const totalSupply = await api.call({ abi: 'function totalSupply() view returns (uint256)', target: strat.lpToken.address, })

        api.add(strat.coins[0].address, deposits * balances._reserve0 / totalSupply)
        api.add(strat.coins[1].address, deposits * balances._reserve1 / totalSupply)
        break
      }
      default : {
        const adapterAddress = await api.call({ abi: 'function adapterAddr() view returns(address)', target: strat.gaugeAddress, })
        const tokenPerShare = await api.call({ abi : 'function tokenPerShare() view returns(uint256 _token0PerShare, uint256 _token1PerShare)', target : adapterAddress})
        const totalSupply = await api.call({ abi: 'function totalSupply() view returns (uint256)', target: strat.lpToken.address, })

        api.add(strat.coins[0].address, deposits * tokenPerShare._token0PerShare / totalSupply)
        api.add(strat.coins[1].address, deposits * tokenPerShare._token1PerShare / totalSupply)
        break
      }
    }
    
    api.add(strat.lpToken.address, deposits)
  }
}

async function bsc(api) {
  // CAKE LOCKER
  const VE_CAKE = '0x5692DB8177a81A6c6afc8084C2976C9933EC1bAB'

  const cakeLock = await api.multiCall({ abi: abi.locks, calls: [{ target: VE_CAKE, params: LOCKERS.pancakeswap[56] }] })
  const cake = Number(cakeLock[0].amount) / 1e18

  // PANCAKE NFT STRATEGIES
  const pcsStratsTvl = await sumTokens2({ 
    api,
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, LOCKERS.pancakeswap[56]]],
    uniV3ExtraConfig: { nftIdFetcher: PANCAKESWAP_MASTERCHEF_V3 }
  })

  // PANCAKE LP STRATEGIES
  await addPancakeSwapLPStrategiesBsc(api)
  return {
    'pancakeswap-token': cake, ...pcsStratsTvl
  }
}

// ----------------------------------- ARBITRUM ----------------------------------- //

async function getLPStrategiesArbitrum(timestamp, block) {
  const resp = await Promise.all([
    get(`${STRATEGIES_ENDPOINT}/curve/42161.json`),
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

// node test.js projects/stakedao/index.js
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