const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");
const { MintLayout } = require("@solana/spl-token");

async function tvl() {
  const connection = getConnection()
  const mint = await connection.getAccountInfo(new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'));
  const mintInfo = MintLayout.decode(mint.data);
  return {
    'uxd-stablecoin': mintInfo.supply.toString()/ (10**mintInfo.decimals)
  };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
}