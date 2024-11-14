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

async function listMarketPublicKeys(
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
  });

  return accounts.map((a) => a.pubkey);
}

async function tvl() {
  const connection = getConnection();
  const marketPks = await listMarketPublicKeys(connection);

  const vaultAccounts = [];
  let globalAccounts = [];
  for (const pk of marketPks) {
    const [buffer, _slot] = await connection
      .getAccountInfoAndContext(pk)
      .then(
        (
          getAccountInfoAndContext,
        ) => {
          return [
            getAccountInfoAndContext.value?.data,
            getAccountInfoAndContext.context.slot,
          ];
        },
      );

    let offset = 16;
    const baseMint = new PublicKey(buffer.subarray(offset, offset + 32));
    const quoteMint = new PublicKey(buffer.subarray(offset + 32, offset + 32 + 32));

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
  solana: {
    tvl,
  },
};