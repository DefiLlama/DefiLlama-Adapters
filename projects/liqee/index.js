
const { compoundExports2 } = require('../helper/compound');

let allControllers = {
  "ethereum": "0x8f1f15DCf4c70873fAF1707973f6029DEc4164b3",
  "bsc": "0x6d290f45A280A688Ff58d095de480364069af110",
}

module.exports = {
  ethereum: compoundExports2({
    comptroller: allControllers.ethereum, abis: {
      getAllMarkets: "address[]:getAlliTokens",
    }
  }),
  bsc: compoundExports2({
    comptroller: allControllers.bsc, abis: {
      getAllMarkets: "address[]:getAlliTokens",
    }
  }),
  start: '2021-08-24', // Aug-24-2021 11:37:56 AM +UTC
}
