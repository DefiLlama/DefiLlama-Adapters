const { getConnection } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');

async function tvl() {
  const tokenAccount = new PublicKey('5N7NsW5yau8bCZjpyzZV4KpMUAVVdw3HMui4ad7pcm9B');
  try {
    const connection = getConnection();
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return {
      'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': balance.value.amount
    };
  } catch (err) {
    // Return 0 if the token account is not yet initialized or funded on Solana mainnet
    return {
      'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': '0'
    };
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
};
