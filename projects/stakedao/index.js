const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const {unwrapCrv} = require('../helper/unwrapLPs')

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

const sanctuary = '0xaC14864ce5A98aF3248Ffbf549441b04421247D3'
const sdtToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'

async function ethereum(timestamp, block) {
  let balances = {};
  const sdtInSactuary = sdk.api.erc20.balanceOf({
    target: sdtToken,
    owner: sanctuary,
    block
  })
  await Promise.all(vaults.map(async vault=>{
    const crvBalance = await sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi[vault.abi]
    })
    await unwrapCrv(balances, vault.crvToken, crvBalance.output, block)
  }))
  sdk.util.sumSingleBalance(balances, sdtToken, (await sdtInSactuary).output)
  return balances
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
    await unwrapCrv(balances, vault.crvToken, crvBalance.output, block, chain='polygon')
  }))

  return balances
}

module.exports = {
  ethereum:{
    tvl: ethereum
  },
  polygon:{
    tvl: polygon
  },
  tvl: sdk.util.sumChainTvls([ethereum, polygon])
}