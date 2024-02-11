const sdk = require('@defillama/sdk');
const { sumTokensExport: sumBRC20TokensExport } = require("../helper/chain/brc20");
const { sumTokensExport } = require('../helper/sumTokens');

// https://medium.com/@merlinchaincrypto/merlins-seal-the-biggest-fair-launch-of-layer2-5614001b2582
// https://bridge.merlinchain.io/api/v1/token_mapping?after=0&size=100

const owners = [
  "bc1qtu66zfqxj6pam6e0zunwnggh87f5pjr7vdr5cd",
  "15zVuow5e9Zwj4nTrxSH3Rvupk32wiKEsr",
  "bc1q4gfsheqz7ll2wdgfwjh2l5hhr45ytc4ekgxaex",
  "bc1qua5y9yhknpysslxypd4dahagj9jamf90x4v90x",
  "bc1qm64dsdz853ntzwleqsrdt5p53w75zfrtnmyzcx",
  "1EEU18ZvWrbMxdXEuqdii6goDKbAbaXiA1",
  "bc1qptgujmlkez7e6744yctzjgztu0st372mxs6702",
  "16LDby5cWxzQqTFJrA1DDmbwABumCQHteG",
  "bc1qq3c6kehun66sdek3q0wmu540n3vg0hgrekkjce",
  "124SzTv3bBXZVPz2Li9ADs9oz4zCfT3VmM",
  "bc1qyqt9zs42qmyf373k7yvy0t3askxd927v304xlv",
];

module.exports = {
  methodology: "Staking tokens via BitStable counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners }),
      sumBRC20TokensExport({ owners }),
    ]),
  },
  ethereum: {
    tvl: sumTokensExport({
      ownerTokens: [
        [["0x7122985656e38BDC0302Db86685bb972b145bD3C"], "0x147A198d803D4a02b8bEc7CC78be1AbE0C3d93E5",], //sttone
        [["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"], "0x8bb6cae3f1cada07dd14ba951e02886ea6bba183", //usdc
        ]]
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: ["0x8bb6cae3f1cada07dd14ba951e02886ea6bba183"],
      tokens: ["0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"] //usdc and usdt
    }),
  },
};