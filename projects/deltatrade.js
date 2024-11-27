const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens } = require('./helper/chain/near')
const { getConfig } = require('./helper/cache')
const { get } = require('./helper/http')

const { PublicKey } = require('@solana/web3.js');
const { sumTokens2, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, } = require('./helper/solana')

const state = new PublicKey('FRcbUFpGHQppvXAyJrNYLKME1BQfowh4xKZB2vt9j6yn');
const programId = new PublicKey('CNLGhYQgNwjyDfHZTEjHfk1MPkqwP96qZahWN82UfcLM');

const GRID_CONTRACT_ID = 'grid.deltatrade.near';
const DCA_CONTRACT_ID = 'dca.deltatrade.near';

const tokens = [
  'wrap.near',
  '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
  'token.v2.ref-finance.near',
  ADDRESSES.near.BURROW,
  'token.lonkingnearbackto2024.near',
  'blackdragon.tkn.near',
  'ftv2.nekotoken.near',
  'gear.enleap.near',
  'token.0xshitzu.near',
  'edge-fast.near',
  '802d89b6e511b335f05024a65161bce7efc3f311.factory.bridge.near',
]

module.exports = {
  timetravel: false,
  near: {
    tvl: () => sumTokens({ tokens, owners: [GRID_CONTRACT_ID, DCA_CONTRACT_ID] }),
  },
  solana: {
    tvl: solanaTvl,
  }
}

async function getTokens() {
  return getConfig('deltatrade/sol-pairs', undefined, {
    fetcher: async () => {
      const { data } = await get('https://solapi.deltatrade.ai/api/bot/grid/pairs');
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

function getGlobalBalanceUser(token) {
  const [globalBalPda] = PublicKey.findProgramAddressSync([Buffer.from("global_balance_user"), state.toBuffer(), new PublicKey(token).toBuffer()], programId);

  // const globalBalTokenAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, new PublicKey(token), new PublicKey(globalBalPda.toString()), true);
  const [tokenAccount] = PublicKey.findProgramAddressSync([new PublicKey(globalBalPda.toString()), TOKEN_PROGRAM_ID, new PublicKey(token)].map(i => i.toBuffer()), ASSOCIATED_TOKEN_PROGRAM_ID)
  return tokenAccount.toString();
}

async function solanaTvl() {
  const tokens = await getTokens();
  const tokenAccounts = tokens.map(getGlobalBalanceUser)
  return sumTokens2({ tokenAccounts })
}
