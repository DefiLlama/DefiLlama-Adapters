const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require("@solana/web3.js");
const { sumTokens2, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } = require('../helper/solana');
const BN = require("bn.js");
const { getConfig } = require('../helper/cache');

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
  const { data } = await getConfig('prophet-fun/markets', 'https://backend.prophet.fun/business-metrics/get-markets?page=1&perPage=1000&sortDirection=desc&sortField=volume24h&statusFromFront=active')
  const ids = data.map(market => market.marketBase.id)
  const tokenAccounts = []

  ids.forEach((roundId) => {
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