const { sumTokensExport } = require("../helper/sumTokens");
const { sumTokens2: sumTokensSolana } = require("../helper/solana");

const BSC_CONTRACT = "0x145CD0d5C3dD0eF1405dCf1b4D2BCE7c611625dB";
const BSC_USDT = "0x55d398326f99059ff775485246999027b3197955";
const BSC_USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";

const SOLANA_CONTRACT = "8iquHJQyXUq8ykTEKZjtS4wSHKnxiw4ghGWUNzPnA9Q4";
const SOLANA_USDT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
const SOLANA_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// async function solanaTvl() {
//   return sumTokensSolana({
//     tokensAndOwners: [
//       [SOLANA_USDT, SOLANA_CONTRACT],
//       [SOLANA_USDC, SOLANA_CONTRACT],
//     ],
//   });
// }

async function solanaTvl() {
  return 0;
}

async function bscTvl() {
  return 0;
}

module.exports = {
  // bsc: { tvl:sumTokensExport({ chain: 'bsc', owner: BSC_CONTRACT, tokens: [BSC_USDT, BSC_USDC] })},
  // solana: {tvl:solanaTvl},
  bsc: { tvl: bscTvl },
  solana: { tvl: solanaTvl },
  methodology: "TVL is calculated by aggregating the token balances (USDT and USDC) held in the protocol contracts on both BSC and Solana chains. The total value locked equals the sum of USDT and USDC balances from both chains.",
};

