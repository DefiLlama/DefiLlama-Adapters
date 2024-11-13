const { sumTokens2, getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js")
const { decodeAccount } = require('../helper/utils/solana/layout')
const BN = require("bn.js");

async function tvl() {
  const connection = getConnection("solana");

  const [aum, rewards] = await Promise.all([
    // Load all tokens belonging to the vault
    sumTokens2({ 
      owner: '4o3qAErcapJ6gRLh1m1x4saoLLieWDu7Rx3wpwLc7Zk9',

      // Do not consider ADX as AUM
      blacklistedTokens: ['AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw'], 
    }),

    // Load rewards
    connection.getAccountInfo(new PublicKey('5GAFPnocJ4GUDJJxtExBDsH5wXzJd3RYzG8goGGCneJi')),
  ]);

  // Remove rewards from AUM
  aum['solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'] = new BN(aum['solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'])
                                                                    .sub(decodeAccount('tokenAccount', rewards).amount).toString();

  return aum ;
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL counts tokens deposited in the Liquidity Pool.",
  solana: {
    tvl
  },
};
