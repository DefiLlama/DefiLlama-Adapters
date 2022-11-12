const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      '12qTdZHx6f77aQ74CPCZGSY47VaRwYjVD8',
      '143gLvWYUojXaWZRrxquRKpVNTkhmr415B',
      '1KVpuCfhftkzJ67ZUegaMuaYey7qni7pPj',
      //These 3 addresses has 48,555 #Bitcoin. This is only less than 3% of the total high value assets we have, including btc, usd, stablecoins, T-bills.. According to Justin Sun https://twitter.com/justinsuntron/status/1590311559242612743
    ],
  },
  ethereum: {
    owners: [
        '0xab5c66752a9e8167967685f1450532fb96d5d24f', //Hot Wallet
        '0xe93381fb4c4f14bda253907b18fad305d799241a', //Hot Wallet
        '0xfa4b5be3f2f84f56703c42eb22142744e95a2c58',
        '0x46705dfff24256421a05d056c29e81bdc09723b8',
        '0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b',
        '0x18916e1a2933cb349145a280473a5de8eb6630cb',
        '0xfdb16996831753d5331ff813c29a93c76834a0ad',
        '0xcac725bef4f114f728cbcfd744a731c2a463c3fc',
        '0x0a98fb70939162725ae66e626fe4b52cff62c2e5',
        '0x5c985e89dde482efe97ea9f1950ad149eb73829b',
        '0xeee28d484628d41a82d01e21d12e2e78d69920da',
        '0xadB2B42F6bD96F5c65920b9ac88619DcE4166f94',
        '0x1062a747393198f70f71ec65a582423dba7e5ab3',
        //all the eth addresses are not confirm by Huobi, we grab them from etherscan labels
    ]
  }
}

module.exports = cexExports(config)