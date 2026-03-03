const { sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey("7abBuE4LdKbyXMxQNJ3UyGVsYmakSAsFQYKgr7GnAht5");
const USDT_MINT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
const SEED_VAULT_AUTHORITY = Buffer.from("vault_authority");

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

const VAULT_NAMES = [
  "VAYVND_30D",
  "LENDAO_30D",
  "LENDSWAP_NG_30D",
  "LENDSWAP_MX_30D",
];

function getVaultAuthority(vaultName) {
  const [authority] = PublicKey.findProgramAddressSync(
    [SEED_VAULT_AUTHORITY, Buffer.from(vaultName)],
    PROGRAM_ID
  );
  return authority;
}

function getAssociatedTokenAddress(mint, owner) {
  const [ata] = PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return ata;
}

async function tvl() {
  const tokenAccounts = VAULT_NAMES.map((name) => {
    const authority = getVaultAuthority(name);
    const ata = getAssociatedTokenAddress(USDT_MINT, authority);
    return ata.toString();
  });

  return sumTokens2({ tokenAccounts });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: "TVL is calculated as USDT locked in staking vault PDAs",
};