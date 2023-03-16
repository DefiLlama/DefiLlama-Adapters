const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount, } = require("../helper/solana");

async function tvl() {
  const connection = getConnection()
  const mint = await connection.getAccountInfo(new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'));
  const mintInfo = decodeAccount('mint', mint)
  return {
    'uxd-stablecoin': mintInfo.supply.toString() / (10 ** mintInfo.decimals)
  };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
}