const { sumTokens2 } = require('../helper/solana');

async function tvl() {
  return sumTokens2({ solOwners: ['FiPhWKk6o16WP9Doe5mPBTxaBFXxdxRAW9BmodPyo9UK'] });
}

module.exports = {
  timetravel: false,
  methodology:
    "Sentinel Trader Bot TVL is calculated by retrieving the SOL balance of the SENTBOT mint authority (or treasury) wallet",
  solana: { tvl },
};