const ADDRESSES = require('../helper/coreAssets.json')
const axios = require('axios');
const { PublicKey } = require("@solana/web3.js");
const { sumTokens2, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } = require('../helper/solana');
const BN = require("bn.js");

const programId = new PublicKey('ProPh6ruVL41JR3XXPuy6hN6TPH1ERqpWkZ9dp9YSEe')
const globalState = new PublicKey('6PZKJowZMUAgxLxAJmHsrvzEL8PdXNymqYSJDwPRgh6V')
const token = new PublicKey(ADDRESSES.solana.USDC)

const getAta = (owner) => {
  const [ata] = PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      token.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID, 
  );
  return ata;
}

function getPredictionMarketAddress(marketId) {
  const [predictionState] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('pred_market_state'),
      new BN(marketId.toString()).toBuffer('le', 8),
      globalState.toBuffer(),
    ],
    programId,
  );
  return predictionState;
}

async function tvl(api) {
  const lastRoundId = await axios.get("https://backend.prophet.fun/business-metrics/last-round-id")
  const tokenAccounts = []

  Array.from({ length: lastRoundId.data.roundId }, (_, i) => i + 1).forEach((roundId) => {
    const marketAddress = getPredictionMarketAddress(roundId)
    const marketAta = getAta(marketAddress)
    tokenAccounts.push(marketAta)
  })
  await sumTokens2({ tokenAccounts, api, allowError: true })
}


module.exports = {
  methodology: 'TVL is total quantity of USDC held in the predictions token accounts',
  start: 1753365600,
  solana: {
    tvl,
  }
}; 