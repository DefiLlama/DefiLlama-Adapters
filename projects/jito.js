const { getStakePoolAccount } = require("@solana/spl-stake-pool");
const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("./helper/solana");

async function tvl() {
  // https://jito.network/staking
  const connection = getConnection();
  const account = await getStakePoolAccount(
    connection,
    new PublicKey("Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb")
  );
  const lamports = account.account.data.totalLamports;
  const sol = lamports.toNumber() / 1_000_000_000;
  return {
    solana: sol,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses the SPL Stake Pool SDK to fetch the total supply of deposited SOL into the Jito Stake Pool",
  solana: {
    tvl,
  },
};
