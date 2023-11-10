const { PublicKey, Keypair } = require('@solana/web3.js');
const { getConnection, sumTokens } = require('../helper/solana');
const { Program } = require('@project-serum/anchor');
const kaminoIdl = require('./kamino-lending-idl.json');
const scopeIdl = require('./scope-idl.json');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

async function tvl() {
  const connection = getConnection();
  const programId = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
  const scopeProgramId = new PublicKey('HFn8GnPADiny6XqUoWE8uRPPxb29ikn4yTuPa9MF2fWJ');
  const markets = ['7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF'];
  const oraclePricesAddress = '3NJYftD5sjVfxSnUdZ1wVML8f3aC6mp1CXCL6L7TnU8C';
  const lendingMarketAuthSeed = 'lma';
  const tokensAndOwners = [];
  const ktokens = {};

  const kaminoLendProgram = new Program(kaminoIdl, programId, { connection, publicKey: PublicKey.unique() });
  const scopeProgram = new Program(scopeIdl, scopeProgramId, { connection, publicKey: PublicKey.unique() });

  const oraclePrices = await scopeProgram.account.oraclePrices.fetch(oraclePricesAddress);
  let tvl = 0;
  for (const market of markets) {
    const reserves = await kaminoLendProgram.account.reserve.all([
      { dataSize: 8624 },
      { memcmp: { offset: 32, bytes: market } },
    ]);

    for (const reserveData of reserves) {
      const reserve = reserveData.account;
      const mint = reserve.liquidity.mintPubkey.toString();
      if (
        ktokens[mint] ||
        (await isKToken(new PublicKey(mint), connection))
      ) {
        ktokens[mint] = true;
        const liq = Number(reserve.liquidity.availableAmount.toString()) / 10 ** Number(reserve.liquidity.mintDecimals);
        const oracle = reserve.config.tokenInfo.scopeConfiguration.priceFeed;
        const chain = reserve.config.tokenInfo.scopeConfiguration.priceChain;
        if (oracle && chain && isScopeChainValid(chain)) {
          const price = getPriceFromScopeChain(chain, oraclePrices);
          tvl += liq * price;
        }
      } else {
        ktokens[mint] = false;
        const [authority] = PublicKey.findProgramAddressSync(
          [Buffer.from(lendingMarketAuthSeed), new PublicKey(market).toBuffer()],
          programId
        );
        tokensAndOwners.push([mint, authority]);
      }
    }
  }
  return { tether: tvl, ...(await sumTokens(tokensAndOwners)) };
}

async function isKToken(mint, connection) {
  const mintAcc = new Token(connection, mint, TOKEN_PROGRAM_ID, Keypair.generate());
  const mintInfo = await mintAcc.getMintInfo();
  const KAMINO_PROGRAM_ID = new PublicKey('6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc');
  const [expectedMintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('authority'), mint.toBuffer()],
    KAMINO_PROGRAM_ID
  );
  return mintInfo.mintAuthority !== null && mintInfo.mintAuthority.equals(expectedMintAuthority);
}

const U16_MAX = 2 ** 16 - 1;

function isScopeChainValid(chain) {

  return !(
    chain.length === 0 ||
    chain.every((tokenId) => tokenId === 0) ||
    chain.every((tokenId) => tokenId === U16_MAX)
  );
}

function getPriceFromScopeChain(chain, prices) {
  // Protect from bad defaults
  if (chain.every((tokenId) => tokenId === 0)) {
    throw new Error('Token chain cannot be all 0s');
  }
  // Protect from bad defaults
  chain = chain.filter((tokenId) => tokenId !== U16_MAX);
  if (chain.length === 0) {
    throw new Error(`Token chain cannot be all ${U16_MAX}s (u16 max)`);
  }
  const priceChain = chain.map((tokenId) => {
    const datedPrice = prices.prices[tokenId];
    if (!datedPrice) {
      throw Error(`Could not get price for token ${tokenId}`);
    }
    const priceInfo = datedPrice.price;
    return Number(priceInfo.value.toString())*(10**(-Number(priceInfo.exp.toString())));
  });

  if (priceChain.length === 1) {
    return priceChain[0];
  }

  // Compute token value by multiplying all values of the chain
  return priceChain.reduce((acc, price) => acc * price, 1);
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: 'TVL consists of deposits made to the protocol, borrowed tokens are not counted.',
  misrepresentedTokens: true,
};
