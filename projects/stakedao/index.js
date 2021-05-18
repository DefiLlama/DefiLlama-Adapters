const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const {unwrapCrv} = require('../helper/unwrapLPs')

const crv_3crv_vault1 = {
  contract: '0x478bBC744811eE8310B461514BDc29D03739084D',
  crvToken: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  abi: 'bal'
}
const crv_3crv_vault2 = {
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
const vaults = [crv_3crv_vault1, crv_3crv_vault2, crv_eurs_vault, crv_btc_vault]

const sanctuary = '0xaC14864ce5A98aF3248Ffbf549441b04421247D3'
const sdtToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'
const sdveCRV = '0x478bBC744811eE8310B461514BDc29D03739084D'
const crvToken = '0xd533a949740bb3306d119cc777fa900ba034cd52'

async function tvl(timestamp, block) {
  let balances = {};
  const sdtInSactuary = sdk.api.erc20.balanceOf({
    target: sdtToken,
    owner: sanctuary,
    block
  })
  const sdveCRVSupply = sdk.api.erc20.totalSupply({
    target: sdveCRV,
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
  sdk.util.sumSingleBalance(balances, crvToken, (await sdveCRVSupply).output)
  return balances
}

module.exports = {
  tvl
}