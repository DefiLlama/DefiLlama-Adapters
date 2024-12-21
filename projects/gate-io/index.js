const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
      '0x234ee9e35f8e9749a002fc42970d570db716453b',
      //'0x925206b8a707096Ed26ae47C84747fE0bb734F59', //this should never be here, its the WBT token wallet
      '0xD793281182A0e3E023116004778F45c29fc14F19',
      '0xc882b111a75c0c657fc507c04fbfcd2cc984f071',
    ],
  },
  avax: {
    owners: [
      '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
      '0xD793281182A0e3E023116004778F45c29fc14F19',
      '0xc882b111a75c0c657fc507c04fbfcd2cc984f071',
    ]
  },
  arbitrum: {
    owners: [
      '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
      '0xD793281182A0e3E023116004778F45c29fc14F19',
      '0xc882b111a75c0c657fc507c04fbfcd2cc984f071',
    ]
  },
  polygon: {
    owners: [
      '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
      '0xD793281182A0e3E023116004778F45c29fc14F19',
      '0xc882b111a75c0c657fc507c04fbfcd2cc984f071',
    ]
  },
  fantom: {
    owners: [
      '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
      '0xD793281182A0e3E023116004778F45c29fc14F19',
      '0xc882b111a75c0c657fc507c04fbfcd2cc984f071',
    ]
  },
  bsc: {
    owners: [
      '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
      '0xD793281182A0e3E023116004778F45c29fc14F19',
      '0xc882b111a75c0c657fc507c04fbfcd2cc984f071',
    ]
  },
  optimism: {
    owners: [
      '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
      '0xD793281182A0e3E023116004778F45c29fc14F19',
      '0xc882b111a75c0c657fc507c04fbfcd2cc984f071',
    ]
  },
  era: {
    owners: [
      '0x0d0707963952f2fba59dd06f2b425ace40b492fe',
      '0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c',
      '0x234ee9e35f8e9749a002fc42970d570db716453b',
   //   '0x925206b8a707096Ed26ae47C84747fE0bb734F59',
      '0xD793281182A0e3E023116004778F45c29fc14F19',
      '0xc882b111a75c0c657fc507c04fbfcd2cc984f071',
      '0x85FAa6C1F2450b9caEA300838981C2e6E120C35c',
      '0xeb01f8cdae433e7b55023ff0b2da44c4c712dce2',
    ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.gateIo
  },
  tron: {
    owners: [
      'TBA6CypYJizwA9XdC7Ubgc5F1bxrQ7SqPt',
      'TCYpJ6MMzd9ytoUvD82HnS58iV75QimPh6',
      'TFptbWaARrWTX5Yvy3gNG5Lm8BmhPx82Bt',
    ]
  },
  cardano:{
    owners: [
      'DdzFFzCqrhseMuShaXzLDGDBa8jGEjdEjNc83jouqdqBQzk5R52MedutUq3QGdMPiauR5SjbttqdBjDA5g6rf3H6LjpvK3dFsf8yZ6qo',
      'DdzFFzCqrhtBatWqyFge4w6M6VLgNUwRHiXTAg3xfQCUdTcjJxSrPHVZJBsQprUEc5pRhgMWQaGciTssoZVwrSKmG1fneZ1AeCtLgs5Y',
    ]
  },
  solana:{
    owners: [
      'CLNEVwuSAiGsvPtE74yLhda4beNfd8qfZXVKkUcAJZDL',
      'HiRpdAZifEsZGdzQ5Xo5wcnaH3D2Jj9SoNsUzcYNK78J',
      'u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w'
    ]
  },
  ripple: {
    owners: [
      'rHcFoo6a9qT5NHiVn1THQRhsEGcxtYCV4d',
      'rLzxZuZuAHM7k3FzfmhGkXVwScM4QSxoY7',
      'rNnWmrc1EtNRe5SEQEs9pFibcjhpvAiVKF',
      'rNu9U5sSouNoFunHp9e9trsLV6pvsSf54z',   
    ]
  },
  starknet: {
    owners: [
      '0x00e91830f84747f37692127b20d4e4f9b96482b1007592fee1d7c0136ee60e6d'  
    ]
  }
}

module.exports = cexExports(config)
