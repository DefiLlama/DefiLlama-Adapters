const {
  PublicKey,
} = require("@solana/web3.js");
const { deserializeAccount } = require("./accounts");
const { Program } = require("@project-serum/anchor");
const PsyAmericanIdl = require("./idl.json");
const { getProvider, sumTokens2, } = require("../helper/solana");

const textEncoder = new TextEncoder();

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

async function getAllOptionAccounts(program) {
  const accts = await program.account.optionMarket.all();
  return accts.map((acct) => ({
    ...acct.account,
    key: acct.publicKey,
  }));
}

async function getPsyAmericanTokenAccounts(anchorProvider) {
  const program = new Program(
    PsyAmericanIdl,
    new PublicKey("R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs"),
    anchorProvider
  );
  const optionMarkets = await getAllOptionAccounts(program);
  const tokensAndOwners = []
  optionMarkets.forEach((market) => {
    tokensAndOwners.push([market.underlyingAssetMint.toBase58(), market.key])
    tokensAndOwners.push([market.quoteAssetMint.toBase58(), market.key])
  });
  return { tokensAndOwners };
}

async function getTokenizedEurosControlledAccounts(anchorProvider) {
  const programId = new PublicKey(
    "FASQhaZQT53W9eT9wWnPoBFw8xzZDey9TbMmJj6jCQTs"
  );
  const [poolAuthority] = await PublicKey.findProgramAddress(
    [textEncoder.encode("poolAuthority")],
    programId
  );
  const tokenProgramAccounts =
    await anchorProvider.connection.getTokenAccountsByOwner(poolAuthority, {
      programId: TOKEN_PROGRAM_ID,
    });
  const tokensAndOwners = []
  tokenProgramAccounts.value.forEach((tokenProgramAccount) => {
    // Decode the account data buffer
    const dataBuffer = tokenProgramAccount.account.data;
    const decoded = deserializeAccount(dataBuffer);
    const mintAddress = decoded.mint.toBase58();
    tokensAndOwners.push([mintAddress, decoded.owner])
  });

  return {  tokensAndOwners, };
}

async function tvl() {
  const anchorProvider = getProvider();
  const responses = await Promise.all([
    getPsyAmericanTokenAccounts(anchorProvider),
    getTokenizedEurosControlledAccounts(anchorProvider),
  ]);
  return sumTokens2({ tokensAndOwners: responses.map(i => i.tokensAndOwners).flat()})
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
