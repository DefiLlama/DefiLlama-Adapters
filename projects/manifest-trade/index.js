const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, } = require("../helper/solana");

const PROGRAM_ADDRESS = 'MNFSTqtC93rEfYHB6hF82sKdZpUDFWkViLByLd1k1Ms';
const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS);
function getVaultAddress(market, mint) {
  const [vaultAddress, _unusedBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), market.toBuffer(), mint.toBuffer()],
    PROGRAM_ID,
  );
  return vaultAddress;
}
function getGlobalVaultAddress(mint) {
  const [globalVaultAddress, _unusedBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('global-vault'), mint.toBuffer()],
    PROGRAM_ID,
  );
  return globalVaultAddress;
}

// Market account: base mint at bytes 16-48, quote mint at 48-80
const MINTS_OFFSET = 16;
const MINTS_LENGTH = 64;

// one scan returns every market with just its two mints, no per-market fetch needed
async function listMarkets(
  connection,
) {
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: '8K9hj5OfcUM=',
          encoding: 'base64',
        },
      },
    ],
    dataSlice: { offset: MINTS_OFFSET, length: MINTS_LENGTH },
  });

  return accounts.map((a) => ({ pk: a.pubkey, data: a.account.data }));
}

async function tvl() {
  const connection = getConnection();
  const markets = await listMarkets(connection);

  const vaultAccounts = [];
  let globalAccounts = [];
  for (const { pk, data } of markets) {
    const baseMint = new PublicKey(data.subarray(0, 32));
    const quoteMint = new PublicKey(data.subarray(32, 64));

    const baseVaultPk = getVaultAddress(pk, baseMint);
    const quoteVaultPk = getVaultAddress(pk, quoteMint);
    vaultAccounts.push(baseVaultPk);
    vaultAccounts.push(quoteVaultPk);

    const baseGlobalPk = getGlobalVaultAddress(baseMint);
    const quoteGlobalPk = getGlobalVaultAddress(quoteMint);
    globalAccounts.push(baseGlobalPk);
    globalAccounts.push(quoteGlobalPk);
  }

  const tokenAccounts = vaultAccounts.concat(globalAccounts);
  return sumTokens2({ tokenAccounts, allowError: true })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  solana: {
    tvl,
  },
};