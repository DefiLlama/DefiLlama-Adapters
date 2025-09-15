const { PublicKey } = require('@solana/web3.js');
const { getConnection, sumTokens2 } = require('../helper/solana');
const { Program } = require('@project-serum/anchor');
const kaminoIdl = require('./kamino-lending-idl.json');
const { MintLayout } = require("../helper/utils/solana/layouts/mixed-layout");
const { getConfig } = require('../helper/cache')

async function tvl() {
  const connection = getConnection();
  const programId = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
  const markets = (await getConfig('kamino-lending', 'https://api.kamino.finance/v2/kamino-market')).map(x => x.lendingMarket);
  const lendingMarketAuthSeed = 'lma';
  const tokensAndOwners = [];
  const ktokens = {};

  const kaminoLendProgram = new Program(kaminoIdl, programId, { connection, publicKey: PublicKey.unique() });
  for (const market of markets) {
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
        const [authority] = PublicKey.findProgramAddressSync(
          [Buffer.from(lendingMarketAuthSeed), new PublicKey(market).toBuffer()],
          programId
        );
        tokensAndOwners.push([reserve.liquidity.mintPubkey, authority]);
      }
    }
  }
  return sumTokens2({ tokensAndOwners })
}

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

async function borrowed(api) {
  const connection = getConnection();
  const programId = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
  const markets = (await getConfig('kamino-lending', 'https://api.kamino.finance/v2/kamino-market')).map(x => x.lendingMarket);
  const ktokens = {};

  const kaminoLendProgram = new Program(kaminoIdl, programId, { connection, publicKey: PublicKey.unique() });
  
  for (const market of markets) {
    const reserves = await kaminoLendProgram.account.reserve.all([
      { dataSize: 8624 },
      { memcmp: { offset: 32, bytes: market } },
    ]);
    for (const reserveData of reserves) {
      const reserve = reserveData.account;
      
      // Skip kTokens like in the tvl function
      if (
        ktokens[reserve.liquidity.mintPubkey] ||
        (await isKToken(new PublicKey(reserve.liquidity.mintPubkey), connection))
      ) {
        ktokens[reserve.liquidity.mintPubkey] = true;
      } else {
        ktokens[reserve.liquidity.mintPubkey] = false;
        
        // Calculate borrowed amount using this formula
        // liquidity.borrowedAmountSf / 2**60 / 10**liquidity.mintDecimals
        const borrowedAmountSf = reserve.liquidity.borrowedAmountSf;
        const borrowedAmount = borrowedAmountSf / Math.pow(2, 60)

        api.add(reserve.liquidity.mintPubkey.toString(), borrowedAmount);
      }
    }
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  methodology: 'TVL consists of deposits made to the protocol, and borrowed tokens are counted.',
};
