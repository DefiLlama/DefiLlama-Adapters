const { PublicKey } = require('@solana/web3.js');
const { getConnection, sumTokens } = require('../helper/solana');
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
  return sumTokens(tokensAndOwners)
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

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: 'TVL consists of deposits made to the protocol, borrowed tokens and kTokens are not counted.',
};
