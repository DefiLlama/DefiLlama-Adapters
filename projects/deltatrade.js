const { sumTokens } = require('./helper/chain/near')
const { getConfig } = require('./helper/cache')
const { get } = require('./helper/http')

const { PublicKey } = require('@solana/web3.js');
const { sumTokens2, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, } = require('./helper/solana')

const state = new PublicKey('FRcbUFpGHQppvXAyJrNYLKME1BQfowh4xKZB2vt9j6yn');
const programId = new PublicKey('CNLGhYQgNwjyDfHZTEjHfk1MPkqwP96qZahWN82UfcLM');

const GRID_CONTRACT_ID = 'grid.deltatrade.near';
const DCA_CONTRACT_ID = 'dca.deltatrade.near';

const nearApi = 'https://api.deltatrade.ai';
const solanaApi = 'https://solapi.deltatrade.ai';


module.exports = {
  timetravel: false,
  near: {
    tvl: nearTVL,
  },
  solana: {
    tvl: solanaTvl,
  }
}

async function getTokens(chain) {
  return getConfig(`deltatrade/${chain}-pairs`, undefined, {
    fetcher: async () => {
      const url = `${chain === 'solana' ? solanaApi : nearApi}/api/bot/grid/pairs`;
      const { data } = await get(url);
      const tokenSet = new Set()
      data.forEach(pair => {
        tokenSet.add(pair.base_token.code)
        tokenSet.add(pair.quote_token.code)
      })
      const arry = Array.from(tokenSet)
      arry.sort()
      return arry
    }
  })
}

async function nearTVL(){
  const tokens = await getTokens('near');
  return sumTokens({ tokens, owners: [GRID_CONTRACT_ID, DCA_CONTRACT_ID] })
}

function getGlobalBalanceUser(token) {
  const [globalBalPda] = PublicKey.findProgramAddressSync([Buffer.from("global_balance_user"), state.toBuffer(), new PublicKey(token).toBuffer()], programId);

  // const globalBalTokenAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, new PublicKey(token), new PublicKey(globalBalPda.toString()), true);
  const [tokenAccount] = PublicKey.findProgramAddressSync([new PublicKey(globalBalPda.toString()), TOKEN_PROGRAM_ID, new PublicKey(token)].map(i => i.toBuffer()), ASSOCIATED_TOKEN_PROGRAM_ID)
  return tokenAccount.toString();
}

async function solanaTvl() {
  const tokens = await getTokens('solana');
  const tokenAccounts = tokens.map(getGlobalBalanceUser)
  return sumTokens2({ tokenAccounts })
}
