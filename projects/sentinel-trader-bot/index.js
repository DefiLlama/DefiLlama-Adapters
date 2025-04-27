const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount, } = require("../helper/solana");

async function tvl() {
  const connection = getConnection()
  const mint = await connection.getAccountInfo(new PublicKey('GVeaBeaHZDJHji4UTzaPJgB1PRiVeCV2EaArjYyiwNdT'));
  const mintInfo = decodeAccount('mint', mint)
  return {
    'SENTBOT': mintInfo.supply.toString() / (10 ** mintInfo.decimals)
  };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
}