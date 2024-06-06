const { stakings } = require("./helper/staking");

const stakingContracts = [
  "0xc3ab35d3075430f52D2636d08D4f29bD39a18B65",
  "0xcD48268d66068963242681Ed7ca39d349Fb690B9",
  "0x2F0596b989d79fda9b0A89F57D982ea02f8D978B",
];
const boggedToken = "0xb09fe1613fe03e7361319d2a43edc17422f36b09";

const lpContracts = [
  "0x2F0596b989d79fda9b0A89F57D982ea02f8D978B",
  "0xc3ab35d3075430f52D2636d08D4f29bD39a18B65",
];
const lpAddresses = [
  "0xdD901faf9652D474b0A70263E13DA294990d49AE",
];

module.exports = {
  bsc: {
    staking: stakings(stakingContracts, boggedToken),
    pool2: stakings(lpContracts, lpAddresses),
    tvl: () => ({}),
  },
}