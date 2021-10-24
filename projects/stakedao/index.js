const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const { unwrapCrv } = require('../helper/unwrapLPs')
const { transformAvaxAddress } = require('../helper/portedTokens');

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

const vaults = [
  crv_3crv_vault, 
  crv_eurs_vault, 
  crv_btc_vault, 
  crv_frax_vault,
  crv_frax_vault2,
  crv_eth_vault
]

const vaultsPolygon = [
  crv_3crv_vault_polygon,
  crv_btc_vault_polygon
]

const vaultsAvalanche = [
  crv_3crv_vault_avalanche
]

const sanctuary = '0xaC14864ce5A98aF3248Ffbf549441b04421247D3'
const sdtToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'
const crvToken = '0xD533a949740bb3306d119CC777fa900bA034cd52'

async function ethereum(timestamp, block) {
  let balances = {};
  const crvInPerpetual = sdk.api.abi.call({
    target: crv_perpetual_vault.crvToken,
    block,
    abi: abi[crv_perpetual_vault.abi],
    params: crv_perpetual_vault.contract
  })
  await Promise.all(vaults.map(async vault=>{
    const crvBalance = await sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi[vault.abi]
    })
    await unwrapCrv(balances, vault.crvToken, crvBalance.output, block)
  }))
  sdk.util.sumSingleBalance(balances, crvToken, (await crvInPerpetual).output.amount)
  return balances
}

async function staking(timestamp, block){
  const sdtInSactuary = sdk.api.erc20.balanceOf({
    target: sdtToken,
    owner: sanctuary,
    block
  })

  return {
    [sdtToken]:(await sdtInSactuary).output
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
    //console.log(crvBalance)
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

module.exports = {
  ethereum:{
    tvl: ethereum
  },
  polygon:{
    tvl: polygon
  },
  avalanche: {
    tvl: avax
  },
  staking:{
    tvl: staking
  },
  tvl: sdk.util.sumChainTvls([ethereum, polygon, avax])
}