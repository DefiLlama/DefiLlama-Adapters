const tokens = require("./tokens");

const farms = [
  {
    pid: 0,
    lpSymbol: "KWOOF",
    lpAddresses: {
      321: "0x192F72eFD1009D90B0e6F82Ff27a0a2389F803e5",
    },
    token: tokens.syrup,
    quoteToken: tokens.wbnb,
  },
  {
    pid: 10,
    lpSymbol: "KAFE-KWOOF LP",
    lpAddresses: {
      321: "0x016b2ec91d6eebf65827c16b612a35187e0db6f9",
    },
    token: tokens.kafe,
    quoteToken: tokens.kwoof,
  },
  {
    pid: 11,
    lpSymbol: "KAFE-USDT LP",
    lpAddresses: {
      321: "0x473666ca99a69c3d445386c0c4d1b524c9e8fd35",
    },
    token: tokens.kafe,
    quoteToken: tokens.busd,
  },
  {
    pid: 1,
    lpSymbol: "KWOOF-KCS LP",
    lpAddresses: {
      321: "0x463e451d05f84da345d641fbaa3129693ce13816",
    },
    token: tokens.kwoof,
    quoteToken: tokens.wbnb,
  },
  {
    pid: 3,
    lpSymbol: "KWOOF-USDT LP",
    lpAddresses: {
      321: "0x5ea4ee58945c7e94c6efdce53d0b46d3dfbcf7db",
    },
    token: tokens.kwoof,
    quoteToken: tokens.busd,
  },
  {
    pid: 4,
    lpSymbol: "KWOOF-USDC LP",
    lpAddresses: {
      321: "0xd05be4d487beffb4eb9dbec9f16158d7c9e60a7c",
    },
    token: tokens.kwoof,
    quoteToken: tokens.usdc,
  },
  {
    pid: 2,
    lpSymbol: "USDT-KCS LP",
    lpAddresses: {
      321: "0x5a4b75cec96b99bc7dda80c42914636a5a46dfb1",
    },
    token: tokens.busd,
    quoteToken: tokens.wbnb,
  },
  {
    pid: 5,
    lpSymbol: "USDC-KCS LP",
    lpAddresses: {
      321: "0x3705eef160335a9aaa375ce31f858ba0a64aade0",
    },
    token: tokens.usdc,
    quoteToken: tokens.wbnb,
  },
  {
    pid: 6,
    lpSymbol: "USDC-USDT LP",
    lpAddresses: {
      321: "0x7060d8bfe77df123c8992d6ebf36b66163124c33",
    },
    token: tokens.usdc,
    quoteToken: tokens.busd,
  },
  {
    pid: 7,
    lpSymbol: "GHOST-KWOOF LP",
    lpAddresses: {
      321: "0x35540268609fbfbbed512bc917d75668e5f5d11d",
    },
    token: tokens.ghost,
    quoteToken: tokens.kwoof,
  },
  {
    pid: 8,
    lpSymbol: "KUST-KWOOF LP",
    lpAddresses: {
      321: "0x4eda6784ed216a30d89da18a73c05dff810c69e2",
    },
    token: tokens.kust,
    quoteToken: tokens.kwoof,
  },
];

module.exports = farms;
