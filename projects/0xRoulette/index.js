const { Connection, PublicKey } = require('@solana/web3.js');

const PROGRAM_ID = "Rou1svrgkcuo1rBNkP1XaESrD9xRpukx2uLY5MsgK14";
const VAULT_ACCOUNT_SIZE = 120;
const VAULT_DISCRIMINATOR = Buffer.from('e6fbf1538bca5d1c', 'hex');

function decodeVaultAccount(data) {
  const tokenMintBuffer = data.slice(0, 32);
  const totalLiquidity = data.readBigUInt64LE(64);
  
  const tokenMint = new PublicKey(tokenMintBuffer).toString();
  
  return {
    tokenMint,
    totalLiquidity: totalLiquidity.toString(),
  };
}

async function tvl(_, _2, _3, { api }) {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const programId = new PublicKey(PROGRAM_ID);

  const accounts = await connection.getProgramAccounts(programId, {
    filters: [{ dataSize: VAULT_ACCOUNT_SIZE }],
  });

  for (const { account } of accounts) {
    if (account.data.slice(0, 8).equals(VAULT_DISCRIMINATOR)) {
      const decoded = decodeVaultAccount(account.data.slice(8));
      api.add(decoded.tokenMint, decoded.totalLiquidity);
    }
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "TVL is calculated by fetching all program accounts using @solana/web3.js. " +
    "Filters for vaults by account size (120 bytes) and discriminator. " +
    "Raw token balances are passed to the SDK for USD conversion.",
  solana: {
    tvl,
  },
};