const { PublicKey } = require("@solana/web3.js");
const { Program } = require("@project-serum/anchor");
const PsyAmericanIdl = require("./idl.json");
const PsyFiV2Idl = require("./psyfiV2Idl.json");
const { getProvider, sumTokens2 } = require("../helper/solana");

const textEncoder = new TextEncoder();

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

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
  const tokensAndOwners = [];
  optionMarkets.forEach((market) => {
    tokensAndOwners.push([market.underlyingAssetMint.toBase58(), market.key]);
    tokensAndOwners.push([market.quoteAssetMint.toBase58(), market.key]);
  });
  return tokensAndOwners;
}

async function getTokenizedEurosControlledAccounts(anchorProvider) {
  const programId = new PublicKey(
    "FASQhaZQT53W9eT9wWnPoBFw8xzZDey9TbMmJj6jCQTs"
  );
  const [poolAuthority] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("poolAuthority")],
    programId
  );
  const tokenProgramAccounts =
    await anchorProvider.connection.getTokenAccountsByOwner(poolAuthority, {
      programId: TOKEN_PROGRAM_ID,
    });
  return tokenProgramAccounts.value.map((i) => i.pubkey.toString());
}

async function getPsyFiEurosTokenAccounts(anchorProvider) {
  const programId = new PublicKey(
    "PSYFiYqguvMXwpDooGdYV6mju92YEbFobbvW617VNcq"
  );
  const program = new Program(
    PsyFiV2Idl,
    programId,
    anchorProvider
  );
  // Load all vaults
  const vaults = await program.account.vaultAccount.all();
  // return all vault collateral accounts
  return vaults.map((vault) => vault.account.vaultCollateralAssetAccount.toString());
}

async function tvl() {
  const anchorProvider = getProvider();
  const [tokensAndOwners, tokenAccounts, psyFiV2TokenAccounts] = await Promise.all([
    getPsyAmericanTokenAccounts(anchorProvider),
    getTokenizedEurosControlledAccounts(anchorProvider),
    getPsyFiEurosTokenAccounts(anchorProvider),
  ]);
  return sumTokens2({ tokenAccounts: [...tokenAccounts, ...psyFiV2TokenAccounts], tokensAndOwners });
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
