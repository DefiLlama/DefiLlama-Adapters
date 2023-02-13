const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0x66A0be112EFE2cc3bc2f09Fa2aCaaf9f593B0265',
        '0xa6F617f873684ED062C9Df281145250b3E4EE2D2',
    ],
  },
  bitcoin: {
    owners: [
        'bc1q36c0rp4ydl6uvvguhw9nr7njm49addzkgftqev',
        'bc1q3z0khuld6nd7esv46nxj9ketteqw9qz86peyeh',
        'bc1q4hz59t7v0uxujuyrhp9679uppur7ke9u3vshvd',
        'bc1qdlrh7ycyqxe62vk5m70y353vmep9ullxx5j9ar',
    ]
  },
  ripple: {
    owners: [
        'r49iM5WS92URBo2w5BFPuKtxNPNTZPCjS2',
        'rhxenffiDqbzaxDtbR9kSEukpjFsA3wvw5',
    ]
  },
  solana: {
    owners: ['EXm3bWhUFXpNtvAgnbQyCMtg89NjSwZzme8RCcs7JPCb']
  },
  cardano: {
    owners: [
        // 'addr1q8wz6tfmp9yaeuy6xyamwrg4eg9hknu2pfyxwh0uhfcpa9wjyjpuv567rtwkxvt88mms37rxtgnxjnhrx65njr8cvmfqxzqye2',
        'addr1qxmsmmjh668w66h4xjvrkyl8wkqcpdnpkn5qhv9yuendnfa0stadpn6g73vwrjs06udq2rnmlpr9twejzdrd7nghk5msus5aqd',
    ]
  }
}

module.exports = cexExports(config)