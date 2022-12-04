const { PublicKey } = require('@solana/web3.js');
const { decodeAccount } = require('../helper/solana')

const SOLIDO_ADDRESS = "49Yi1TKkNyYjPAFdR9LBvoHcUjuPX4Df5T5yv39w2XTn";
const RESERVE_ACCOUNT_ADDRESS = "3Kwv3pEAuoe4WevPB4rgMBTZndGDb53XT7qwQKnvHPfX";

async function retrieveValidatorsBalance(connection) {
  const accountInfo = await connection.getAccountInfo(new PublicKey(SOLIDO_ADDRESS));
  const deserializedAccountInfo = decodeAccount('lido', accountInfo)
  return deserializedAccountInfo.validators.entries
    .map(pubKeyAndEntry => pubKeyAndEntry.entry)
    .map(validator => validator.stake_accounts_balance.toNumber())
    .reduce((prev, current) => prev + current, 0)
}

async function retrieveReserveAccountBalance(connection) {
  const accountInfo = await connection.getAccountInfo(new PublicKey(RESERVE_ACCOUNT_ADDRESS));
  const rent = await connection.getMinimumBalanceForRentExemption(accountInfo.data.byteLength);
  return accountInfo.lamports - rent;
}

module.exports = {
  retrieveValidatorsBalance,
  retrieveReserveAccountBalance
}