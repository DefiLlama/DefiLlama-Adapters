const tokens = require("./tokens");
const farms = [
  {
    pid: 0,
    lpSymbol: "WOOF",
    lpAddresses: {
      56: "0x9e26c50B8A3b7652c3fD2B378252A8647a0C9268",
      97: "0x43eef5BA4899431F7F9D855E9C5Ed06016c8227b",
    },
    token: tokens.syrup,
    quoteToken: tokens.wbnb,
  },
  {
    pid: 1,
    lpSymbol: "WOOF-BNB LP",
    lpAddresses: {
      56: "0xccefc6013a4f3e1c4e71c5006353a55e228f4c2d",
      97: "0x5d6ddb67bcef8dd94a7f4ade4f5b912da9bacd62",
    },
    token: tokens.woof,
    quoteToken: tokens.wbnb,
  },
  {
    pid: 18,
    lpSymbol: "CUPCAKE-WOOF LP",
    lpAddresses: {
      97: "",
      56: "0x897a60da157cdca5faff2fd9314e72b763dda9cd",
    },
    token: tokens.cupcake,
    quoteToken: tokens.woof,
  },
  {
    pid: 21,
    lpSymbol: "CUPCAKE-BUSD LP",
    lpAddresses: {
      97: "",
      56: "0x9e20535e12d1ef96a3838ea27256ee6c767f644f",
    },
    token: tokens.cupcake,
    quoteToken: tokens.busd,
  },
  {
    pid: 3,
    lpSymbol: "WOOF-BUSD SHIBANCE LP",
    lpAddresses: {
      97: "0x00ce857d4a66beF6614E2EBAcf16c8fF5C451146",
      56: "0x6e729f2ed894fbcebc14dfd7344975a558052c55",
    },
    token: tokens.woof,
    quoteToken: tokens.busd,
  },
  {
    pid: 4,
    lpSymbol: "WOOF-BUSD PANCAKESWAP LP",
    lpAddresses: {
      97: "0x638798c119ffC95482423981884c0461664d7195",
      56: "0xe064a0666b86d5554e83adf4bf14fa6d5ffc4175",
    },
    token: tokens.woof,
    quoteToken: tokens.busd,
  },
  {
    pid: 2,
    lpSymbol: "BUSD-BNB LP",
    lpAddresses: {
      56: "0xf5ef5e2ecfb73126ea2db39703e4f6269d484f61",
      97: "0x354f0d65790d44ac7ad65354e150dd8a1aa76f48",
    },
    token: tokens.busd,
    quoteToken: tokens.wbnb,
  },
  {
    pid: 6,
    lpSymbol: "DOGE-BUSD LP",
    lpAddresses: {
      97: "0xaC0AEC94af77eDCc868BDb7BA816380c5129E163",
      56: "0xe076028cecc3e9390e9ae1222b7c99b13de95627",
    },
    token: tokens.doge,
    quoteToken: tokens.busd,
  },
  {
    pid: 20,
    lpSymbol: "BIRB-WOOF LP",
    lpAddresses: {
      97: "",
      56: "0x9809eFcc1E1cDEE2BbA0Efd23ec000ca840725cb",
    },
    token: tokens.birb,
    quoteToken: tokens.woof,
  },
  {
    pid: 15,
    lpSymbol: "MOONSHOT-WOOF LP",
    lpAddresses: {
      97: "",
      56: "0xaa19A0bF68acc25e6a853044AA0f9E9c08C97A7d",
    },
    token: tokens.moonshot,
    quoteToken: tokens.woof,
  },
  {
    pid: 8,
    lpSymbol: "CUMMIES-WOOF LP",
    lpAddresses: {
      97: "",
      56: "0x8Fe92296F007F7B864765BAEc58fCfB7820d71B6",
    },
    token: tokens.cummies,
    quoteToken: tokens.woof,
  },
  {
    pid: 11,
    lpSymbol: "CUMMIES-BUSD LP",
    lpAddresses: {
      97: "",
      56: "0x82b34a5384d337a8f306d1d49063d7e22ebcc296",
    },
    token: tokens.cummies,
    quoteToken: tokens.busd,
  },
  {
    pid: 16,
    lpSymbol: "CAKE-WOOF LP",
    lpAddresses: {
      97: "",
      56: "0xba7e74e2d06d7a76025413a1f338ab849084843b",
    },
    token: tokens.cake,
    quoteToken: tokens.woof,
  },
  {
    pid: 17,
    lpSymbol: "CAKE-BUSD LP",
    lpAddresses: {
      97: "",
      56: "0xcda8205d6bd1619bf79b27e765e4e29651fd987e",
    },
    token: tokens.cake,
    quoteToken: tokens.busd,
  },
  {
    pid: 14,
    lpSymbol: "ASS-WOOF LP",
    lpAddresses: {
      97: "",
      56: "0x2e4a51084eae9237388bec1dce2a26afcbbdb568",
    },
    token: tokens.ass,
    quoteToken: tokens.woof,
  },
  {
    pid: 13,
    lpSymbol: "ASS-BUSD LP",
    lpAddresses: {
      97: "0xF7a8F04bFE8813Ad888d1b6a123aACc2DD86B120",
      56: "0xb719c3f92cdbf7d8426217ae323509b8cee8f4b9",
    },
    token: tokens.ass,
    quoteToken: tokens.busd,
  },
  {
    pid: 9,
    lpSymbol: "SAFEMOON-WOOF LP",
    lpAddresses: {
      97: "",
      56: "0x5261bd9a6fed9361cbf5d00c831e11d7db6bdf54",
    },
    token: tokens.safemoon,
    quoteToken: tokens.woof,
  },
  {
    pid: 10,
    lpSymbol: "SAFEMOON-BUSD LP",
    lpAddresses: {
      97: "",
      56: "0x916c7e58017e24de428b48a05db7531dd478a75b",
    },
    token: tokens.safemoon,
    quoteToken: tokens.busd,
  },
  {
    pid: 7,
    lpSymbol: "BABYDOGE-WOOF LP",
    lpAddresses: {
      97: "",
      56: "0x3627589F64e3942b18549361fC35a5F2Bd08eF77",
    },
    token: tokens.babydoge,
    quoteToken: tokens.woof,
  },
  {
    pid: 12,
    lpSymbol: "BABYDOGE-BUSD LP",
    lpAddresses: {
      97: "",
      56: "0x1f6753200130e3478c7d02671bb7234220f4520c",
    },
    token: tokens.babydoge,
    quoteToken: tokens.busd,
  },
  {
    pid: 5,
    lpSymbol: "USDT-BUSD LP",
    lpAddresses: {
      97: "0x2E2b6cdB1ea0C39b397EbFc50BF2117437819002",
      56: "0x6f5ae0eb19343b8b1b1426fc11fa9ae1f0a15159",
    },
    token: tokens.usdt,
    quoteToken: tokens.busd,
  },
];

module.exports = farms;