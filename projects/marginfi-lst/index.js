const {  getConnection, } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

async function tvl() {
  const connection = getConnection();
  const account = await connection.getAccountInfo(new PublicKey('DqhH94PjkZsjAqEze2BEkWhFQJ6EyU6MdtMphMgnXqeK'));
  const lstTvlSolana = Number(account.data.readBigUint64LE(258))/1e9;

  return {
    solana: lstTvlSolana
  }
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
