const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const { unwrapCrv } = require('../helper/unwrapLPs')
const { transformAvaxAddress, transformBscAddress } = require('../helper/portedTokens');
const BigNumber = require("bignumber.js");

// Mainnet
const crv_3crv_vault = {
  contract: '0xB17640796e4c27a39AF51887aff3F8DC0daF9567',
  crvToken: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  abi: 'balance'
}
const crv_eurs_vault = {
  contract: '0xCD6997334867728ba14d7922f72c893fcee70e84',
  crvToken: '0x194eBd173F6cDacE046C53eACcE9B953F28411d1',
  abi: 'balance'
}
const crv_btc_vault = {
  contract: '0x24129B935AfF071c4f0554882C0D9573F4975fEd',
  crvToken: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
  abi: 'balance'
}
const crv_frax_vault = {
  contract: '0x5af15DA84A4a6EDf2d9FA6720De921E1026E37b7',
  crvToken: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
  abi: 'balance'
}
const crv_frax_vault2 = {
  contract: '0x99780beAdd209cc3c7282536883Ef58f4ff4E52F',
  crvToken: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
  abi: 'balance'
}
const crv_eth_vault = {
  contract: '0xa2761B0539374EB7AF2155f76eb09864af075250',
  crvToken: '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c',
  abi: 'balance'
}
const crv_perpetual_vault = {
  contract: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
  crvToken: '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2',
  abi: 'locked'
}
const crv_steth_vault = {
  contract: '0xbC10c4F7B9FE0B305e8639B04c536633A3dB7065',
  crvToken: '0x06325440D014e39736583c165C2963BA99fAf14E',
  abi:'balance'
}
const angle_vault = {
  contract: '0x79B738e404208e9607c3B4D4B3800Ed0d4A0e05F',
  sanUsdcEurGauge: '0x51fE22abAF4a26631b2913E417c0560D547797a7',
  usdcToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  stableMasteFront: '0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87',
  usdcPoolManager: '0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD',
  abi:'balanceOf',
  abiCM: 'collateralMap'
}
const fxs_locker_vault = {
  contract: '0xCd3a267DE09196C48bbB1d9e842D7D7645cE448f',
  veFxsToken: '0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0',
  abi: 'locked'
}
const angle_locker_vault = {
  contract: '0xD13F8C25CceD32cdfA79EB5eD654Ce3e484dCAF5',
  veAngleToken: '0x0C462Dbb9EC8cD1630f1728B2CFD2769d09f0dd5',
  abi: 'locked'
}

// Polygon
const crv_3crv_vault_polygon = {
  contract: '0x7d60F21072b585351dFd5E8b17109458D97ec120',
  crvToken: '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
  abi: 'balance'
}
const crv_btc_vault_polygon = {
  contract: '0x953Cf8f1f097c222015FFa32C7B9e3E96993b8c1',
  crvToken: '0xf8a57c1d3b9629b77b6726a042ca48990A84Fb49',
  abi: 'balance'
}

// Avalanche
const crv_3crv_vault_avalanche = {
  contract: '0x0665eF3556520B21368754Fb644eD3ebF1993AD4',
  crvToken: '0x1337BedC9D22ecbe766dF105c9623922A27963EC',
  abi: 'balance'
}

// Harmony
const crv_3crv_vault_harmony = {
  contract: '0x787C95Fb37FFc32e36121aD49CA27b7E3D45b77e',
  crvToken: '0xC5cfaDA84E902aD92DD40194f0883ad49639b023',
  abi: 'balance'
}

// BSC
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

const vaults = [
  crv_3crv_vault, 
  crv_eurs_vault, 
  crv_btc_vault, 
  crv_frax_vault,
  crv_frax_vault2,
  crv_eth_vault,
  crv_steth_vault,
]

const vaultsPolygon = [
  crv_3crv_vault_polygon,
  crv_btc_vault_polygon
]

const vaultsAvalanche = [
  crv_3crv_vault_avalanche
]

const vaultsHarmony = [
  crv_3crv_vault_harmony
]

const vaultsBsc = [
  btcEPS_vault_bsc,
  EPS3_vault_bsc,
  fusdt3EPS_vault_bsc
]

const sanctuary = '0xaC14864ce5A98aF3248Ffbf549441b04421247D3'
const arbStrat = '0x20D1b558Ef44a6e23D9BF4bf8Db1653626e642c3'
const veSdt = '0x0C30476f66034E11782938DF8e4384970B6c9e8a'
const sdtToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'
const crvToken = '0xD533a949740bb3306d119CC777fa900bA034cd52'
const fxsToken = '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'
const angleToken = '0x31429d1856aD1377A8A0079410B297e1a9e214c2'

async function ethereum(timestamp, block) {
  let balances = {};
  const crvInPerpetual = sdk.api.abi.call({
    target: crv_perpetual_vault.crvToken,
    block,
    abi: abi[crv_perpetual_vault.abi],
    params: crv_perpetual_vault.contract
  })
  const fxsInLocker = sdk.api.abi.call({
    target: fxs_locker_vault.veFxsToken,
    block,
    abi: abi[fxs_locker_vault.abi],
    params: fxs_locker_vault.contract
  })
  const angleInLocker = sdk.api.abi.call({
    target: angle_locker_vault.veAngleToken,
    block,
    abi: abi[angle_locker_vault.abi],
    params: angle_locker_vault.contract
  })
  const sanUsdcEurInVault = sdk.api.abi.call({
    target: angle_vault.sanUsdcEurGauge,
    block,
    abi: abi[angle_vault.abi],
    params: angle_vault.contract
  })
  const collateralMap = sdk.api.abi.call({
    target: angle_vault.stableMasteFront,
    block,
    abi: abi[angle_vault.abiCM],
    params: angle_vault.usdcPoolManager
  })
  const sanUsdcEurRate = (await collateralMap).output.sanRate
  const sanUsdcEurVaultBalance = (await sanUsdcEurInVault).output
  await Promise.all(vaults.map(async vault=>{
    const crvBalance = await sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi[vault.abi]
    })
    await unwrapCrv(balances, vault.crvToken, crvBalance.output, block)
  }))
  sdk.util.sumSingleBalance(balances, crvToken, (await crvInPerpetual).output.amount)
  sdk.util.sumSingleBalance(balances, fxsToken, (await fxsInLocker).output.amount)
  sdk.util.sumSingleBalance(balances, angleToken, (await angleInLocker).output.amount)
  sdk.util.sumSingleBalance(balances, angle_vault.usdcToken, (sanUsdcEurVaultBalance * sanUsdcEurRate / 10**18).toFixed(0))
  return balances
}

async function staking(timestamp, block){
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

async function harmony(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const block = chainBlocks.harmony
  await Promise.all(vaultsHarmony.map(async vault=>{
    const crvBalance = await sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi[vault.abi], 
      chain: 'harmony'
    })
    await unwrapCrv(balances, vault.crvToken, crvBalance.output, block, 'harmony', addr=>`harmony:${addr}`)
  }))

  return balances
}

async function bsc(timestamp, ethBlock, chainBlocks) {
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
    tvl: ethereum,
    staking
  },
  polygon:{
    tvl: polygon
  },
  avalanche: {
    tvl: avax
  },
  harmony: {
    tvl: harmony
  },
  bsc: {
    tvl: bsc,
  }
}