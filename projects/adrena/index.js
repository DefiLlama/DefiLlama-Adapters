const { sumTokens2, getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js")
const { decodeAccount } = require('../helper/utils/solana/layout')
const BN = require("bn.js");

async function staking() {
  const connection = getConnection("solana");

  const res = await connection.getMultipleAccountsInfo([
    // ADX Staked Tokens
    new PublicKey('9nD5AenzdbhRqWo7JufdNBbC4VjZ5QH7jzLuvPZy2rhb'),

    // ALP Staked Tokens
    new PublicKey('HYDnBK56NXcdaeKzVqTRBbm4aaRmfy2oErjrb1YfH7Zg'),
  ]);

  return {
    // ADX
    'solana:AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw': decodeAccount('tokenAccount', res[0]).amount.toString(),
    
    // ALP
    'solana:4yCLi5yWGzpTWMQ1iWHG5CrGYAdBkhyEdsuSugjDUqwj': decodeAccount('tokenAccount', res[1]).amount.toString(),
  };
}

async function tvl() {
  const connection = getConnection("solana");

  const [aum, rewards] = await Promise.all([
    // Load all tokens belonging to the vault
    sumTokens2({ 
      owner: '4o3qAErcapJ6gRLh1m1x4saoLLieWDu7Rx3wpwLc7Zk9',

      // Do not consider ADX and ALP as AUM
      blacklistedTokens: ['AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw', '4yCLi5yWGzpTWMQ1iWHG5CrGYAdBkhyEdsuSugjDUqwj'], 
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
  start: 1727253403, // Wed Sep 25 2024 08:36:43 GMT+0
  methodology: "TVL counts tokens deposited in the Liquidity Pool.",
  hallmarks: [
    [1727253403, "Launch"], // Wed Sep 25 2024 08:36:43 GMT+0
    [1731326400, "Ranked Pre-season Launch"], // Mon Nov 11 2024 12:00:00 GMT+0
    [1734955200, "Ranked Pre-season End"], // Mon Dec 23 2024 12:00:00 GMT+0
  ],
  solana: {
    tvl,
    staking,
  },
};
