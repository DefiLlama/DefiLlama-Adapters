const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const { default: BigNumber } = require("bignumber.js");

const crv_3crv_vault1 = {
  contract: '0x478bBC744811eE8310B461514BDc29D03739084D',
  crvToken: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  swap: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
  underlyingTokens: ['0xdac17f958d2ee523a2206206994597c13d831ec7', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x6b175474e89094c44da98b954eedeac495271d0f'],
  abi: 'bal'
}
const crv_3crv_vault2 = {
  contract: '0xB17640796e4c27a39AF51887aff3F8DC0daF9567',
  crvToken: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  swap: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
  underlyingTokens: ['0xdac17f958d2ee523a2206206994597c13d831ec7', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x6b175474e89094c44da98b954eedeac495271d0f'],
  abi: 'balance'
}
const crv_eurs_vault = {
  contract: '0xCD6997334867728ba14d7922f72c893fcee70e84',
  crvToken: '0x194eBd173F6cDacE046C53eACcE9B953F28411d1',
  swap: '0x0Ce6a5fF5217e38315f87032CF90686C96627CAA',
  underlyingTokens: ['0xdb25f211ab05b1c97d595516f45794528a807ad8', '0xd71ecff9342a5ced620049e616c5035f1db98620'],
  abi: 'balance'
}
const crv_btc_vault = {
  contract: '0x24129B935AfF071c4f0554882C0D9573F4975fEd',
  crvToken: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
  swap: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
  underlyingTokens: ['0xeb4c2781e4eba804ce9a9803c67d0893436bb27d', '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6'],
  abi: 'balance'
}
const vaults = [crv_3crv_vault1, crv_3crv_vault2, crv_eurs_vault, crv_btc_vault]

const sanctuary = '0xaC14864ce5A98aF3248Ffbf549441b04421247D3'
const sdtToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'

async function tvl(timestamp, block) {
  let balances = {};
  const sdtInSactuary = sdk.api.erc20.balanceOf({
    target: sdtToken,
    owner: sanctuary,
    block
  })
  await Promise.all(vaults.map(async vault=>{
    const crvBalance = sdk.api.abi.call({
      target: vault.contract,
      block,
      abi: abi[vault.abi]
    })
    const crvTotalSupply = sdk.api.erc20.totalSupply({
      target: vault.crvToken,
      block,
    })
    const underlyingSwapTokens = (await sdk.api.abi.multiCall({
      calls: vault.underlyingTokens.map(token=>({
        target:token,
        params: [vault.swap]
      })),
      block,
      abi: 'erc20:balanceOf'
    })).output
    const resolvedCrvBalance = (await crvBalance).output
    const resolvedCrvTotalSupply = (await crvTotalSupply).output
    underlyingSwapTokens.forEach(call=>{
      const underlyingBalance = BigNumber(call.output).times(resolvedCrvBalance).div(resolvedCrvTotalSupply)
      const prevBalance = BigNumber(balances[call.input.target] || '0')
      balances[call.input.target] = prevBalance.plus(underlyingBalance).toFixed()
    })
  }))
  sdk.util.sumSingleBalance(balances, sdtToken, (await sdtInSactuary).output)
  return balances
}

module.exports = {
  name: 'StakeDAO',
  token: 'SDT',
  category: 'staking',
  start: 0, // WRONG!
  tvl
}