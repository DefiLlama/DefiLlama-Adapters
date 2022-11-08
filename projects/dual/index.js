const { PublicKey, } = require("@solana/web3.js");
const { getConnection, sumTokens2, } = require("../helper/solana");

function readBigUInt64LE(buffer, offset) {
  const first = buffer[offset];
  const last = buffer[offset + 7];
  if (first === undefined || last === undefined) {
    throw new Error();
  }
  const lo = first + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + buffer[++offset] * 2 ** 24;
  const hi = buffer[++offset] + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + last * 2 ** 24;
  return BigInt(lo) + (BigInt(hi) << BigInt(32));
}

async function tvl() {
  const connection = getConnection();
  const dualProgramID = new PublicKey("DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki");
  let programAccounts = await connection.getProgramAccounts(dualProgramID);

  const tokenAccounts = programAccounts
    .filter(i => i.account.data.length === 260)
    .map(i => parseDipState(i.account.data))
    .map(i => JSON.parse(JSON.stringify(i)))
    .map(i => [i.vaultSpl, i.vaultUsdc])
    .flat()

  return sumTokens2({ tokenAccounts })
}

function parseDipState(buf) {
  const strike = Number(readBigUInt64LE(buf, 8));
  const expiration = Number(readBigUInt64LE(buf, 16));
  const splMint = new PublicKey(buf.slice(24, 56));
  const vaultMint = new PublicKey(buf.slice(56, 88));
  const vaultMintBump = Number(buf.readUInt8(88));
  const vaultSpl = new PublicKey(buf.slice(89, 121));
  const vaultSplBump = Number(buf.readUInt8(121));
  const optionMint = new PublicKey(buf.slice(122, 154));
  const optionBump = Number(buf.readUInt8(154));
  const vaultUsdc = new PublicKey(buf.slice(155, 187));
  const vaultUsdcBump = Number(buf.readUInt8(187));
  const usdcMint = new PublicKey(buf.slice(188, 220));
  return {
    strike,
    expiration,
    splMint,
    vaultMint,
    vaultMintBump,
    vaultSpl,
    vaultSplBump,
    optionMint,
    optionBump,
    vaultUsdc,
    vaultUsdcBump,
    usdcMint,
  };
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
