const sdk = require('@defillama/sdk');
const { Connection } = require('@solana/web3.js')
const { Pool } = require('@everlend/general-pool');
const { deserialize } = require('@everlend/common')

const { POOL_MARKET_PUBKEY, TOKENS_META_DATA } = require('./constants');
const { accountInfoToLamports, convertLamportsToTokenAmount } = require("../helper/everlend");

const ENDPOINT = 'https://solana-mainnet.everstake.one'
const connection = new Connection(ENDPOINT, 'recent')


function tvl() {
  return async () => {
    const balances = {};
    const response = await Pool.findMany(connection, {
      poolMarket: POOL_MARKET_PUBKEY,
    });
    const tokenMints = response.map((pool) => pool.data.tokenMint);
    const tokenAccounts = response.map((pool) => pool.data.tokenAccount);

    const tokenAccountsInfo = await connection.getMultipleAccountsInfo(
      tokenAccounts,
    );
    const tokenMintsInfo = await connection.getMultipleAccountsInfo(
      tokenMints,
    );

    await Promise.all(
      response.map( async (pool, index) => {
        const {
          publicKey,
          data: { totalAmountBorrowed },
        } = pool;
        const poolPubKey = publicKey.toString();
        const tokenMeta = TOKENS_META_DATA[poolPubKey];

        if (!tokenMeta) return null;

        const totalAmountBorrowedNum = totalAmountBorrowed.toNumber();


        const tokenMintInfoRaw = tokenMintsInfo[index];
        let tokenMintInfoBuffer;
        let tokenMintInfo;
        if (tokenMintInfoRaw) {
          tokenMintInfoBuffer = Buffer.from(tokenMintInfoRaw.data);
          tokenMintInfo = deserialize(tokenMintInfoBuffer);
        }

        const tokenMintDecimals = tokenMintInfo.decimals;

        const tokenAccountBalance = accountInfoToLamports(
          tokenAccountsInfo[index]
        );

        const totalPoolSize = tokenAccountBalance + totalAmountBorrowedNum;

        const totalPoolAmount = convertLamportsToTokenAmount(totalPoolSize, tokenMintDecimals)

        sdk.util.sumSingleBalance(balances, tokenMeta.name, totalPoolAmount)
      })
    );
    console.log(balances);
    return balances;
  };
}
const obj = {
  solana: {
    tvl: tvl(),
  }
}
obj.solana.tvl()


module.exports = {
  timetravel: false,
  solana: {
    tvl: tvl(),
  }
};
