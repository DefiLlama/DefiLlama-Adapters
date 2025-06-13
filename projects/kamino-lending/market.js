const { PublicKey } = require('@solana/web3.js');
const { getConnection, sumTokens2 } = require('../helper/solana.js');
const { Program } = require('@project-serum/anchor');
const kaminoIdl = require('./kamino-lending-idl.json');
const { MintLayout } = require("../helper/utils/solana/layouts/mixed-layout");

async function isKToken(mint, connection) {
  const mintInfo = await connection.getAccountInfo(new PublicKey(mint.toString()));
  const rawMint = MintLayout.decode(mintInfo.data.slice(0, MintLayout.span));
  const KAMINO_PROGRAM_ID = new PublicKey('6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc');
  const [expectedMintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('authority'), mint.toBuffer()],
    KAMINO_PROGRAM_ID
  );
  return rawMint.mintAuthority !== null && rawMint.mintAuthority.equals(expectedMintAuthority);
}

async function tvlForMarkets(api, market, borrowed = false) {
  const connection = getConnection();
  const programId = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
  const lendingMarketAuthSeed = 'lma';
  const tokensAndOwners = [];
  const ktokens = {};

  const kaminoLendProgram = new Program(kaminoIdl, programId, { connection, publicKey: PublicKey.unique() });
  const reserves = await kaminoLendProgram.account.reserve.all([
    { dataSize: 8624 },
    { memcmp: { offset: 32, bytes: market } },
  ]);

  for (const reserveData of reserves) {
    const reserve = reserveData.account;
    if (
      ktokens[reserve.liquidity.mintPubkey] ||
      (await isKToken(new PublicKey(reserve.liquidity.mintPubkey), connection))
    ) {
      ktokens[reserve.liquidity.mintPubkey] = true;
    } else {
      ktokens[reserve.liquidity.mintPubkey] = false;
      if (borrowed) {
        // Calculate borrowed amount using this formula
        // liquidity.borrowedAmountSf / 2**60 / 10**liquidity.mintDecimals
        const borrowedAmountSf = reserve.liquidity.borrowedAmountSf;
        const mintDecimals = reserve.liquidity.mintDecimals;
        const borrowedAmount = borrowedAmountSf / Math.pow(2, 60) / Math.pow(10, mintDecimals);
        api.add(reserve.liquidity.mintPubkey.toString(), borrowedAmount);
      } else {
        const [authority] = PublicKey.findProgramAddressSync(
          [Buffer.from(lendingMarketAuthSeed), new PublicKey(market).toBuffer()],
          programId
        );
        tokensAndOwners.push([reserve.liquidity.mintPubkey.toString(), authority]);
      }
    }
  }
  if (borrowed) {
    return api.balances;
  } else {
    return sumTokens2({ tokensAndOwners, api });
  }
}

module.exports = {
  tvlForMarkets,
}