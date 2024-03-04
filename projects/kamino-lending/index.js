const { PublicKey, Keypair } = require('@solana/web3.js');
const { getConnection, sumTokens } = require('../helper/solana');
const { Program } = require('@project-serum/anchor');
const kaminoIdl = require('./kamino-lending-idl.json');
const { MintLayout } = require("../helper/utils/solana/layouts/mixed-layout");

async function tvl() {
  const connection = getConnection();
  const programId = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
  const markets = ['7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF', 'DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek'];
  const lendingMarketAuthSeed = 'lma';
  // const scope = new Scope('mainnet-beta', connection);
  // const oraclePrices = await scope.getOraclePrices();
  const tokensAndOwners = [];
  const ktokens = {};

  const kaminoLendProgram = new Program(kaminoIdl, programId, { connection, publicKey: PublicKey.unique() });
  let tvl = 0;
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
        /* ktokens[reserve.liquidity.mintPubkey] = true;
        const liq = Number(reserve.liquidity.availableAmount.toString()) / 10 ** Number(reserve.liquidity.mintDecimals);
        const oracle = reserve.config.tokenInfo.scopeConfiguration.priceFeed;
        const chain = reserve.config.tokenInfo.scopeConfiguration.priceChain;
        if (oracle && chain && Scope.isScopeChainValid(chain)) {
          const price = await scope.getPriceFromChain(chain, oraclePrices);
          tvl += liq * price.toNumber();
        } */
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
  // return { tether: tvl, ...(await sumTokens(tokensAndOwners)) };
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
  methodology: 'TVL consists of deposits made to the protocol, borrowed tokens are not counted.',
};
