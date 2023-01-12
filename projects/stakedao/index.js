const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const { unwrapCrv, sumTokensExportPromise } = require('./utils')
const { transformAvaxAddress, transformBscAddress } = require('../helper/portedTokens');
const BigNumber = require("bignumber.js");
const axios = require('axios');

const STRATEGIES_ENDPOINT = 'https://lockers.stakedao.org/api/strategies/cache';
const LOCKERS_ENDPOINT = 'https://lockers.stakedao.org/api/lockers/cache';

async function strategiesCurveBalancer(timestamp, block) {
  const resp = await Promise.all([
    axios.get(`${STRATEGIES_ENDPOINT}/curve`),
    axios.get(`${STRATEGIES_ENDPOINT}/balancer`)
  ]);

  const strats = resp[0].data.concat(resp[1].data)
  const lgv4 = strats.map((strat) => [strat.infos.protocolLiquidityGaugeV4, strat.infos.angleLocker || strat.infos.curveLocker])

  return lgv4
}

async function ethereum(timestamp, block) {
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
  await Promise.all(vaults.map(async vault=>{
    const balance = await sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi['balance']
    })
    await unwrapCrv(balances, vault.token, balance.output, block)
  }))
 
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
  const angle_sanUSDC_V2 = {
    contract: '0x79B738e404208e9607c3B4D4B3800Ed0d4A0e05F',
    sanUsdcEurGauge: '0x51fE22abAF4a26631b2913E417c0560D547797a7',
    usdcToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    abi:'balanceOf',
  } 
  const angle_sanUSDC_V3 = {
    contract: angle_protocol.locker,
    sanUsdcEurGauge: '0x51fE22abAF4a26631b2913E417c0560D547797a7',
    usdcToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    abi:'balanceOf',
  }
  const angle_sanDAI_V3 = {
    contract: angle_protocol.locker,
    sanDaiEurGauge: '0x8E2c0CbDa6bA7B65dbcA333798A3949B07638026',
    daiToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    abi:'balanceOf',
  }
  const angle_sanFRAX_V3 = {
    contract: angle_protocol.locker,
    sanFraxEurGauge: '0xb40432243E4F317cE287398e72Ab8f0312fc2FE8',
    fraxToken: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    abi:'balanceOf',
  }
  const angle_sushi_agEUR_V3 = {
    contract: angle_protocol.locker,
    sushiAgEURGauge: '0xBa625B318483516F7483DD2c4706aC92d44dBB2B',
    sushiAgEURToken: '0x1f4c763BdE1D4832B3EA0640e66Da00B98831355',
    abi:'balanceOf',
  }
  const angle_guni_agEUR_usdc_V3 = {
    contract: angle_protocol.locker,
    guniAgEURUsdcGauge: '0xEB7547a8a734b6fdDBB8Ce0C314a9E6485100a3C',
    guniAgEURUsdcToken: '0xEDECB43233549c51CC3268b5dE840239787AD56c',
    abi:'balanceOf',
  }

  // ==== Calls Balance ==== //
  const sanUsdcEurV2 = sdk.api.abi.call({
    target: angle_sanUSDC_V2.sanUsdcEurGauge,
    block,
    abi: abi[angle_sanUSDC_V2.abi],
    params: angle_sanUSDC_V2.contract
  })
  const sanUsdcEurV3 = sdk.api.abi.call({
    target: angle_sanUSDC_V3.sanUsdcEurGauge,
    block,
    abi: abi[angle_sanUSDC_V3.abi],
    params: angle_sanUSDC_V3.contract
  })
  const sanDaiEurV3 = sdk.api.abi.call({
    target: angle_sanDAI_V3.sanDaiEurGauge,
    block,
    abi: abi[angle_sanDAI_V3.abi],
    params: angle_sanDAI_V3.contract
  })
  const sanFraxEurV3 = sdk.api.abi.call({
    target: angle_sanFRAX_V3.sanFraxEurGauge,
    block,
    abi: abi[angle_sanFRAX_V3.abi],
    params: angle_sanFRAX_V3.contract
  })
  const angleSushiAgEurV3 = sdk.api.abi.call({
    target: angle_sushi_agEUR_V3.sushiAgEURGauge,
    block,
    abi: abi[angle_sushi_agEUR_V3.abi],
    params: angle_sushi_agEUR_V3.contract
  })
  const angleGuniAgEurUSDCV3 = sdk.api.abi.call({
    target: angle_guni_agEUR_usdc_V3.guniAgEURUsdcGauge,
    block,
    abi: abi[angle_guni_agEUR_usdc_V3.abi],
    params: angle_guni_agEUR_usdc_V3.contract
  })

  // ==== Calls Rate ==== //
  const collateralMapUsdc = sdk.api.abi.call({
    target: angle_protocol.stableMasteFront,
    block,
    abi: abi[angle_protocol.abiCM],
    params: angle_protocol.usdcPoolManager
  })
  const collateralMapDai = sdk.api.abi.call({
    target: angle_protocol.stableMasteFront,
    block,
    abi: abi[angle_protocol.abiCM],
    params: angle_protocol.daiPoolManager
  })
  const collateralMapFrax = sdk.api.abi.call({
    target: angle_protocol.stableMasteFront,
    block,
    abi: abi[angle_protocol.abiCM],
    params: angle_protocol.fraxPoolManager
  })
  // ==== Use Rate ==== //
  const sanUsdcEurRate = (await collateralMapUsdc).output.sanRate
  const sanDaiEurRate = (await collateralMapDai).output.sanRate
  const sanFraxEurRate = (await collateralMapFrax).output.sanRate

  // ==== Map ==== //
  //sdk.util.sumSingleBalance(balances, angle_sanUSDC_V2.usdcToken, ((await sanUsdcEurV2).output  * sanUsdcEurRate / 10**18))
  sdk.util.sumSingleBalance(balances, angle_sanUSDC_V3.usdcToken, ((await sanUsdcEurV3).output  * sanUsdcEurRate / 10**18))
  sdk.util.sumSingleBalance(balances, angle_sanDAI_V3.daiToken, (((await sanDaiEurV3).output  * sanDaiEurRate / 10**18)))
  sdk.util.sumSingleBalance(balances, angle_sanFRAX_V3.fraxToken, (((await sanFraxEurV3).output  * sanFraxEurRate / 10**18)))
  sdk.util.sumSingleBalance(balances, angle_sushi_agEUR_V3.sushiAgEURToken, (((await angleSushiAgEurV3).output )))
  sdk.util.sumSingleBalance(balances, angle_guni_agEUR_usdc_V3.guniAgEURUsdcToken, (((await angleGuniAgEurUSDCV3).output )))
  
  /////////////////////////////////////////////////////////////////////
  // --- LIQUID LOCKERS
  /////////////////////////////////////////////////////////////////////
  const resp = await Promise.all([
    axios.get(`${LOCKERS_ENDPOINT}`)
  ]);

  let lockersInfos = []
  for (let i = 0; i< resp[0].data.length;++i) {
    lockersInfos.push({contract: `${resp[0].data[i].infos.locker}`, veToken: `${resp[0].data[i].infos.ve}`, token: `${resp[0].data[i].infos.token}`})
  }

  for (let i = 0; i< lockersInfos.length; ++i) {
    sdk.util.sumSingleBalance(
      balances, 
      lockersInfos[i].token, 
      (await sdk.api.abi.call({
        target: lockersInfos[i].veToken,
        block,
        abi: abi['locked'],
        params: lockersInfos[i].contract
      })).output.amount
    )
  }

  return balances
}

async function staking(timestamp, block) {
  const sanctuary = '0xaC14864ce5A98aF3248Ffbf549441b04421247D3'
  const arbStrat = '0x20D1b558Ef44a6e23D9BF4bf8Db1653626e642c3'
  const veSdt = '0x0C30476f66034E11782938DF8e4384970B6c9e8a'
  const sdtToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'

  const sdtInSactuary = await sdk.api.erc20.balanceOf({
    target: sdtToken,
    owner: sanctuary,
    block
  })

  const sdtInArbStrategy = await sdk.api.erc20.balanceOf({
    target: sdtToken,
    owner: arbStrat,
    block
  })

  const sdtInLocker = await sdk.api.erc20.balanceOf({
    target: sdtToken,
    owner: veSdt,
    block
  })

  const totalSDTStaked = BigNumber(sdtInSactuary.output)
  .plus(BigNumber(sdtInArbStrategy.output))
  .plus(BigNumber(sdtInLocker.output))
  .toFixed()

  return {
    [sdtToken]:totalSDTStaked
  }
}

async function polygon(timestamp, ethBlock, chainBlocks) {
  const crv_3crv_vault_polygon = {
    contract: '0x7d60F21072b585351dFd5E8b17109458D97ec120',
    crvToken: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
    abi: 'balance'
  }
  const vaultsPolygon = [
    crv_3crv_vault_polygon,
  ]

  let balances = {};
  const block = chainBlocks.polygon
  await Promise.all(vaultsPolygon.map(async vault=>{
    const crvBalance = await sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi[vault.abi], 
      chain: 'polygon'
    })  
    await unwrapCrv(balances, vault.crvToken, crvBalance.output, block, 'polygon', addr=>`polygon:${addr}`)
  }))
  return balances
}

async function avax(timestamp, ethBlock, chainBlocks) {
  const crv_3crv_vault_avalanche = {
    contract: '0x0665eF3556520B21368754Fb644eD3ebF1993AD4',
    crvToken: '0x1337BedC9D22ecbe766dF105c9623922A27963EC',
    abi: 'balance'
  }

  const vaultsAvalanche = [
    crv_3crv_vault_avalanche
  ]

  const transformAddress = await transformAvaxAddress()
  let balances = {};
  const block = chainBlocks.avax
  await Promise.all(vaultsAvalanche.map(async vault=>{
    const crvBalance = await sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi[vault.abi], 
      chain: 'avax'
    })  
    await unwrapCrv(balances, vault.crvToken, crvBalance.output, block, 'avax', addr=>`avax:${addr}`)
  }))

  // map from avax to ethereum token address 
  const dai_eth_address = transformAddress('0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a')
  const usdc_eth_address = transformAddress('0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664')
  const usdt_eth_address = transformAddress('0xde3A24028580884448a5397872046a019649b084')

  // avDAI
  const avDAI = 'avax:0x47AFa96Cdc9fAb46904A55a6ad4bf6660B53c38a'
  balances[dai_eth_address] = balances[avDAI]
  delete balances[avDAI]
  // avUSDC
  const avUSDC = 'avax:0x46A51127C3ce23fb7AB1DE06226147F446e4a857'
  balances[usdc_eth_address] = balances[avUSDC]
  delete balances[avUSDC]
  // avUSDT
  const avUSDT = 'avax:0x532E6537FEA298397212F09A61e03311686f548e'
  balances[usdt_eth_address] = balances[avUSDT]
  delete balances[avUSDT]

  return balances
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  const btcEPS_vault_bsc = {
    contract: '0xf479e1252481360f67c2b308F998395cA056a77f',
    crvToken: '0x2a435ecb3fcc0e316492dc1cdd62d0f189be5640',
    abi: 'balance'
  }
  const EPS3_vault_bsc = {
    contract: '0x4835BC54e87ff7722a89450dc26D9dc2d3A69F36',
    crvToken: '0xaf4de8e872131ae328ce21d909c74705d3aaf452',
    abi: 'balance'
  }
  const fusdt3EPS_vault_bsc = {
    contract: '0x8E724986B08F2891cD98F7F71b5F52E7CFF420de',
    crvToken: '0x373410a99b64b089dfe16f1088526d399252dace',
    abi: 'balance'
  }

  const vaultsBsc = [
    btcEPS_vault_bsc,
    EPS3_vault_bsc,
    fusdt3EPS_vault_bsc
  ]

  let balances = {};
  const block = chainBlocks.bsc;
  const transform = await transformBscAddress();
  await Promise.all(vaultsBsc.map(async vault=>{

    const crvBalance = (await sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi[vault.abi], 
      chain: 'bsc'
    })).output;

    switch(vault.crvToken) {
      case '0x2a435ecb3fcc0e316492dc1cdd62d0f189be5640':
        balances['bitcoin'] = crvBalance / 10 ** 18; break;
      case '0xaf4de8e872131ae328ce21d909c74705d3aaf452':
        balances['usd-coin'] = crvBalance / 10 ** 18; break;
      case '0x373410a99b64b089dfe16f1088526d399252dace':
        balances['tether'] = crvBalance / 10 ** 18; break;
    }
  }))
  return balances
}

// node test.js projects/stakedao/index.js
module.exports = {
  ethereum:{
    tvl: sumTokensExportPromise({
          chain: 'ethereum',
          tokensAndOwnersPromise: strategiesCurveBalancer,
          resolveLP: true,
          balancesPromise: ethereum
        }), 
        staking 
  },
  polygon: {
    tvl: polygon
  },
  avax:{
    tvl: avax
  },
  bsc: {
    tvl: bsc,
  }
}