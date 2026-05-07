const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/sumTokens");
const { sumTokens2: sumTokensSolana } = require("../helper/solana");

const BSC_CONTRACT = "0x145CD0d5C3dD0eF1405dCf1b4D2BCE7c611625dB";
const BSC_USDT = ADDRESSES.bsc.USDT;
const BSC_USDC = ADDRESSES.bsc.USDC;

const SOLANA_CONTRACT = "8iquHJQyXUq8ykTEKZjtS4wSHKnxiw4ghGWUNzPnA9Q4";
const SOLANA_USDT = ADDRESSES.solana.USDT;
const SOLANA_USDC = ADDRESSES.solana.USDC;

async function solanaTvl() {
  return sumTokensSolana({
    tokensAndOwners: [
      [SOLANA_USDT, SOLANA_CONTRACT],
      [SOLANA_USDC, SOLANA_CONTRACT],
    ],
  });
}

module.exports = {
  bsc: { tvl:sumTokensExport({ chain: 'bsc', owner: BSC_CONTRACT, tokens: [BSC_USDT, BSC_USDC] })},
  solana: {tvl:solanaTvl},
  methodology: "Count the total balance across all pools for all trading pairs.",
}

