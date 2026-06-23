const { getUniTVL } = require('../helper/unknownTokens')

const { exportDexTVL, getConnection } = require("../helper/solana");
const { PublicKey } = require('@solana/web3.js');
const { decodeAccount } = require('../helper/utils/solana/layout');

const PROGRAM_ID = 'Dooar9JkhdZ7J3LHN3A7YCuoGRUggXhQaG4kijfLGU2j';
const TOKEN_SWAP_SIZE  = 324;

async function getDooarTokenAccounts(chain) {
  const connection = getConnection(chain);
  const pk = new PublicKey(PROGRAM_ID);
  const rawAccounts = await connection.getProgramAccounts(pk);

  const tokenAccounts = [];
  for (const { account } of rawAccounts) {
    if (account.data.length !== TOKEN_SWAP_SIZE) continue;

    const swap = decodeAccount('tokenSwap', account);
    tokenAccounts.push(swap.tokenAccountA.toString());
    tokenAccounts.push(swap.tokenAccountB.toString());
  }
  return tokenAccounts;
}


module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x1e895bFe59E3A5103e8B7dA3897d1F2391476f3c', 
      useDefaultCoreAssets: true
    })
  },
  solana:{
    tvl: exportDexTVL(PROGRAM_ID, getDooarTokenAccounts)
  }
};