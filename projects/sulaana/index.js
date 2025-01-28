const getStakedSulBalance = require("../helper/chain/pollux");

const SULAANA_CONTRACT_ADDRESS="PGM9RMkJ3yB5r9vtzHG6yca4hd4DjvweC5";
const SULMINE_CONTRACT_ADDRESS_ENCODED="000000000000000000000000968cf48070f154927bbe03819db99105e17df975";
const CALLER_ADDRESS="PSzTrL9rUT9ak5MZbResVqUV9Ztqz83PAA"

async function tvl() {
    const totalSulbalance = await getStakedSulBalance(SULAANA_CONTRACT_ADDRESS,SULMINE_CONTRACT_ADDRESS_ENCODED,CALLER_ADDRESS)
    return totalSulbalance
}

module.exports = {
  methodology: 'Counts the Sulaana token present in the contract.',
  pollux: {
    tvl,
  }
}; 