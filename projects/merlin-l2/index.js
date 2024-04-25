const ADDRESSES = require('../helper/coreAssets.json')
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
  "bc1qgxdqf7837dxe8xkhvctgc499kwh5xw7ap3uwhs", // add on 25/02/2024
  "bc1pruhkl5exjt0z824cafauf750f5g08azuvgcjctv0enz5csayaj7ss3j5wc", // add on 25/02/2024
  "bc1q97vmervc8x9hzr4z4yvzn3x4rk74se6e8x8sgy", // add on 25/02/2024
  "bc1q2lzqzjcq472x8v0kgdcn4m5y8cq95ysnxm6vemu0qsuqgzyge06sqmqdal", // add on 25/02/2024
  "bc1qcmj5lkumeycyn35lxc3yr32k3fzue87yrjrna6", //nft_vault_address
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
        [[ADDRESSES.ethereum.USDC], "0x8bb6cae3f1cada07dd14ba951e02886ea6bba183",],//usdc
        [[ADDRESSES.null],"0xC40329D3aE56Af6b0757C3fE53941DDCC3d92671",]] //eth
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: ["0x8bb6cae3f1cada07dd14ba951e02886ea6bba183",],
      tokens: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE] //usdc and usdt
    }),
  },
  zkfair: {
    tvl: sumTokensExport({
      owners: ["0x8E3e71f5c016A3c764D0D0210fF71F15BEa46e3b",],
      tokens: ["0x4b21b980d0Dc7D3C0C6175b0A412694F3A1c7c6b", "0x3f97bf3Cd76B5cA9D4A4E9cD8a73C24E32d6C193", "0x813bCb548F99Bc081e5EFeeAa65e3018befb92Ae",ADDRESSES.null,"0x1cD3E2A23C45A690a18Ed93FD1412543f464158F",] // eth usdt and wbtc and usdc and zkf
    }),
  },
};
