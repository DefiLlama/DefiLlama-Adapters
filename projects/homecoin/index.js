const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const HOME = "0xb8919522331C59f5C16bDfAA6A121a6E03A91F62";


module.exports = {
    misrepresentedTokens: true,
  deadFrom: '2022-11-09',
  ethereum: {
    tvl: sumTokensExport({ owner: HOME, tokens: [ADDRESSES.ethereum.USDC] }),
    borrowed: ()=>({}), // it's all bad debt
  },
  methodology:
    "The base TVL metric counts only USDC liquidity in the protocol." +
    "The Borrowed TVL component also counts home loans made by the protocol.",
};
