const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount } = require("../helper/solana");

const BRASA_POOL = "4z6piA8DWGfbZge1xkwtkczpZEMsgReNh5AsCKZUQE9X";

async function tvl() {
  const connection = getConnection('fogo');
  const poolAddress = new PublicKey(BRASA_POOL);
  const accountInfo = await connection.getAccountInfo(poolAddress);
  const poolData = decodeAccount('stakePool', accountInfo);

  // totalLamports represents total FOGO staked (9 decimals)
  return {
    fogo: Number(poolData.totalLamports) / 1e9,
  };
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated as the total FOGO staked in the Brasa stake pool",
  fogo: {
    tvl,
  },
};
