const { sumTokens2 } = require('../helper/solana');

async function tvl() {
  var test = await sumTokens2({ solOwners: ['FiPhWKk6o16WP9Doe5mPBTxaBFXxdxRAW9BmodPyo9UK'] });
  console.log(await test);
  return test;
}

module.exports = {
  timetravel: false,
  methodology:
    "Sentinel Trader Bot TVL is calculated by retrieving the SOL balance of the SENTBOT mint authority (or treasury) wallet",
  solana: { tvl },
};