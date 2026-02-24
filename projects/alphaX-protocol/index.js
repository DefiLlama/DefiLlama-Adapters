const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const walletAddresses = {
  ethereum: ['0xEc0377A6Bc71c4A28288A5CfD307b80c53A7E1e1'],
  arbitrum: ['0xEc0377A6Bc71c4A28288A5CfD307b80c53A7E1e1'],
  bsc: ['0x8259f6010A030BCD54335503bA91BBA70a534Ca6'],
}

const tokenAddress = {
  ethereum: [ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC, ADDRESSES.null],
  arbitrum: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE],
  bsc: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC, ADDRESSES.bsc.BTCB, ADDRESSES.null, "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF", "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE","0xbA2aE424d960c26247Dd6c32edC70B295c744C43","0x3ee2200efb3400fabb9aacf31297cbdd1d435d47","0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD","0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3","0x1CE0c2827e2eF14D5C4f29a091d735A204794041"],
}

Object.keys(walletAddresses).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owners: walletAddresses[chain], tokens: tokenAddress[chain], })
  }
})