const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

const SAVE_SOL_STAKE_POOL_ADDRESS = 'SAVEY1fVMBeRVo9V9rgEz8ENTvHreftd3QgpAKBDFV4';

async function tvl() {
  const connection = getConnection();
  const account = await connection.getAccountInfo(new PublicKey(SAVE_SOL_STAKE_POOL_ADDRESS))
  return {
    solana: Number(account.data.readBigUint64LE(258))/1e9
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses the SPL Stake Pool SDK to fetch the total supply of deposited SOL into the SaveSOL Stake Pool",
  solana: {
    tvl,
  },
};
