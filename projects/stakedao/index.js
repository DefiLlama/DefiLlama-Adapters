const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache');

const STRATEGIES_ENDPOINT = 'https://lockers.stakedao.org/api/strategies/cache';
const LOCKERS_ENDPOINT = 'https://lockers.stakedao.org/api/lockers/cache';

async function strategiesCurveBalancer(timestamp, block) {
  const resp = await Promise.all([
    getConfig('stakedao/curve', `${STRATEGIES_ENDPOINT}/curve`),
    getConfig('stakedao/balancer', `${STRATEGIES_ENDPOINT}/balancer`)
  ]);

  const strats = resp[0].concat(resp[1])
  const lgv4 = strats.map((strat) => [strat.infos.protocolLiquidityGaugeV4, strat.infos.angleLocker || strat.infos.curveLocker])

  return lgv4
}

async function tvl(timestamp, block, _, { api }) {
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
  // --- STRATEGIES ANGLE 
  /////////////////////////////////////////////////////////////////////
  // ==== Addresses ==== //
  const angle_protocol = {
    stableMasteFront: '0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87',
    usdcPoolManager: '0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD',
    fraxPoolManager: '0x6b4eE7352406707003bC6f6b96595FD35925af48',
    daiPoolManager: '0xc9daabC677F3d1301006e723bD21C60be57a5915',
    locker: '0xD13F8C25CceD32cdfA79EB5eD654Ce3e484dCAF5',
    abiCM: 'collateralMap'
  }
  const angle_sanUSDC_V3 = {
    contract: angle_protocol.locker,
    sanUsdcEurGauge: '0x51fE22abAF4a26631b2913E417c0560D547797a7',
    usdcToken: ADDRESSES.ethereum.USDC,
    abi: 'balanceOf',
  }
  const angle_sanDAI_V3 = {
    contract: angle_protocol.locker,
    sanDaiEurGauge: '0x8E2c0CbDa6bA7B65dbcA333798A3949B07638026',
    daiToken: ADDRESSES.ethereum.DAI,
    abi: 'balanceOf',
  }
  const angle_sanFRAX_V3 = {
    contract: angle_protocol.locker,
    sanFraxEurGauge: '0xb40432243E4F317cE287398e72Ab8f0312fc2FE8',
    fraxToken: ADDRESSES.ethereum.FRAX,
    abi: 'balanceOf',
  }
  const angle_sushi_agEUR_V3 = {
    contract: angle_protocol.locker,
    sushiAgEURGauge: '0xBa625B318483516F7483DD2c4706aC92d44dBB2B',
    sushiAgEURToken: '0x1f4c763BdE1D4832B3EA0640e66Da00B98831355',
    abi: 'balanceOf',
  }
  const angle_guni_agEUR_usdc_V3 = {
    contract: angle_protocol.locker,
    guniAgEURUsdcGauge: '0xEB7547a8a734b6fdDBB8Ce0C314a9E6485100a3C',
    guniAgEURUsdcToken: '0xEDECB43233549c51CC3268b5dE840239787AD56c',
    abi: 'balanceOf',
  }

  // ==== Calls Balance ==== //
  const [
    sanUsdcEurV3,
    sanDaiEurV3,
    sanFraxEurV3,
    angleSushiAgEurV3,
    angleGuniAgEurUSDCV3,
  ] = await api.multiCall({
    abi: abi[angle_sanUSDC_V3.abi], calls: [
      angle_sanUSDC_V3.sanUsdcEurGauge,
      angle_sanDAI_V3.sanDaiEurGauge,
      angle_sanFRAX_V3.sanFraxEurGauge,
      angle_sushi_agEUR_V3.sushiAgEURGauge,
      angle_guni_agEUR_usdc_V3.guniAgEURUsdcGauge,
    ].map(i => ({ target: i, params: angle_sanUSDC_V3.contract }))
  })

  // ==== Calls Rate ==== //
  const [
    sanUsdcEurRate,
    sanDaiEurRate,
    sanFraxEurRate,
  ] = (await api.multiCall({
    abi: abi[angle_protocol.abiCM], calls: [{
      target: angle_protocol.stableMasteFront,
      params: angle_protocol.usdcPoolManager
    }, {
      target: angle_protocol.stableMasteFront,
      params: angle_protocol.daiPoolManager
    }, {
      target: angle_protocol.stableMasteFront,
      params: angle_protocol.fraxPoolManager
    },]
  })).map(i => i.sanRate)

  // ==== Map ==== //
  //sdk.util.sumSingleBalance(balances, angle_sanUSDC_V2.usdcToken, ((await sanUsdcEurV2)  * sanUsdcEurRate / 10**18))
  sdk.util.sumSingleBalance(balances, angle_sanUSDC_V3.usdcToken, (sanUsdcEurV3 * sanUsdcEurRate / 10 ** 18))
  sdk.util.sumSingleBalance(balances, angle_sanDAI_V3.daiToken, ((sanDaiEurV3 * sanDaiEurRate / 10 ** 18)))
  sdk.util.sumSingleBalance(balances, angle_sanFRAX_V3.fraxToken, ((sanFraxEurV3 * sanFraxEurRate / 10 ** 18)))
  sdk.util.sumSingleBalance(balances, angle_sushi_agEUR_V3.sushiAgEURToken, angleSushiAgEurV3)
  sdk.util.sumSingleBalance(balances, angle_guni_agEUR_usdc_V3.guniAgEURUsdcToken, angleGuniAgEurUSDCV3)

  const strategies = await strategiesCurveBalancer()

  /////////////////////////////////////////////////////////////////////
  // --- LIQUID LOCKERS
  /////////////////////////////////////////////////////////////////////
  const resp = await getConfig('stakedao/locker', LOCKERS_ENDPOINT)

  let lockersInfos = []
  for (let i = 0; i < resp.length; ++i) {
    lockersInfos.push({ contract: `${resp[i].infos.locker}`, veToken: `${resp[i].infos.ve}`, token: `${resp[i].infos.token}` })
  }

  // To deal with special vePendle case
  const vePendle = "0x4f30A9D41B80ecC5B94306AB4364951AE3170210"
  const veMAV = "0x4949Ac21d5b2A0cCd303C20425eeb29DCcba66D8".toLowerCase()
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
  let lockerPendleBal = await api.multiCall({ abi: "function positionData(address arg0) view returns (uint128 amount, uint128 end)", calls: callsPendle })
  let lockerMAVBal = []

  for (const { contract, veToken } of callsMAV) {
    const count = await api.call({  abi: 'function lockupCount(address) view returns (uint256)', target: veToken, params: contract })
    let balance = 0
    for (let i = 0; i < count; i++) {
      const lockup = await api.call({ abi: 'function lockups(address,uint256) view returns (uint256 amount, uint256 end, uint256 points)', target: veToken, params: [contract, i] })
      balance += +lockup.amount
    }
    lockerMAVBal.push({ amount: balance, end: 0 })
  }

  console.log(lockerBals, lockerPendleBal, lockerMAVBal)

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

  return sumTokens2({ api, tokensAndOwners: strategies, balances, })
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

async function polygon(timestamp, ethBlock, chainBlocks, { api, }) {
  const crv_3crv_vault_polygon = {
    contract: '0x7d60F21072b585351dFd5E8b17109458D97ec120',
  }
  const vaultsPolygon = [
    crv_3crv_vault_polygon,
  ]
  return getBalances(api, vaultsPolygon)
}

async function getBalances(api, vaults, { balances = {} } = {}) {
  const tokens = await api.multiCall({ abi: 'address:token', calls: vaults.map(i => i.contract) })
  const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults.map(i => i.contract) })
  tokens.forEach((token, i) => sdk.util.sumSingleBalance(balances, token, bals[i], api.chain))
  return balances
}

async function avax(timestamp, ethBlock, chainBlocks, { api }) {
  const crv_3crv_vault_avalanche = {
    contract: '0x0665eF3556520B21368754Fb644eD3ebF1993AD4',
  }

  const vaultsAvalanche = [
    crv_3crv_vault_avalanche
  ]
  return getBalances(api, vaultsAvalanche)
}

async function bsc(timestamp, ethBlock, chainBlocks, { api }) {
  const btcEPS_vault_bsc = {
    contract: '0xf479e1252481360f67c2b308F998395cA056a77f',
  }
  const EPS3_vault_bsc = {
    contract: '0x4835BC54e87ff7722a89450dc26D9dc2d3A69F36',
  }
  const fusdt3EPS_vault_bsc = {
    contract: '0x8E724986B08F2891cD98F7F71b5F52E7CFF420de',
  }

  const vaultsBsc = [
    btcEPS_vault_bsc,
    EPS3_vault_bsc,
    fusdt3EPS_vault_bsc
  ].map(i => i.contract)

  const [bitcoin, usdc, tether] = (await api.multiCall({ abi: abi.balance, calls: vaultsBsc })).map(i => i / 1e18)
  return {
    bitcoin, tether, 'usd-coin': usdc
  }
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
  }
}