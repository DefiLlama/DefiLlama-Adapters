const { PublicKey } = require('@solana/web3.js');
const { sumTokens2 } = require('../helper/solana')
const { getConnection } = require("../helper/solana");
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const GFX_TOKEN = 'GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD'
const STAKE_REWARDS_PROGRAM = '24dximAcSUp1aM3uyQ7Cdpsg128ZVpYRwJBz5k4P6HMc'
const GAMMA_VAULT = new PublicKey('ALfS4oPB5684XwTvCjWw7XddFfmyTNdcY7xHxbh2Ui8s')
async function tvl() {
  const connection = getConnection();
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(GAMMA_VAULT, {
    programId: TOKEN_PROGRAM_ID,
  });
  const values = tokenAccounts.value.map(account => account.pubkey.toString())
  return sumTokens2({ tokenAccounts: values})
}
async function staking() {
  return sumTokens2({ owner: STAKE_REWARDS_PROGRAM, tokens: [GFX_TOKEN] })
}
module.exports = {
  timetravel: false,
  solana: {
    tvl, staking,
  },
}