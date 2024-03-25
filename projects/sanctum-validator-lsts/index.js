const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount } = require("../helper/solana");

async function tvl() {
  // https://github.com/igneous-labs/sanctum-lst-list
  const connection = getConnection();

  // get sanctum stake pool pools
  const poolAccounts = await connection.getParsedProgramAccounts(new PublicKey("SP12tWFxD9oJsVWNavTTBZvMbA6gkAmxtVgxdqvyvhY"), {
      filters: [
        {
          dataSize: 611, // number of bytes
        },
      ],
    })

  // decode pool data
  const poolAccountsDecoded = poolAccounts.map(poolAccount => decodeAccount("scnStakePool", poolAccount.account))

  const poolMints = poolAccountsDecoded.map(value => value.poolMint)

  // get all lsts inside infinity
  const lstStateListAccount = await connection.getAccountInfo(
    new PublicKey("Gb7m4daakbVbrFLR33FKMDVMHAprRZ66CSYt4bpFwUgS")
  );

  // decode state list data
  const infinityLstsAccount = decodeAccount("sanctumValidatorLsts", lstStateListAccount);

  // filter out non sanctum deployed lsts
  const sanctumDeployedLstsInfinity = infinityLstsAccount.filter(item => poolMints.find(mint => mint.equals(item.mint)));
  

  const totalSanctumDeployedLstsStake = poolAccountsDecoded.map(value => value.totalStakeLamports / 1e9).reduce((acc, curr) => acc + curr)
  const totalSanctumDeployedLstsInfinity = sanctumDeployedLstsInfinity.map(value => value.solValue / 1e9).reduce((acc, curr) => acc + curr)

  return {
    solana: totalSanctumDeployedLstsStake - totalSanctumDeployedLstsInfinity,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses the SPL Stake Pool SDK to fetch the total supply of deposited SOL into the various Sanctum-powered stake pools",
  solana: {
    tvl,
  },
};
