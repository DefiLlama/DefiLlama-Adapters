const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount } = require("../helper/solana");

async function tvl() {
  // https://github.com/igneous-labs/sanctum-lst-list
  const connection = getConnection();

  // get sanctum single validator stake pools (SVSP)
  const singleValidatorStakePoolAccounts = await connection.getParsedProgramAccounts(new PublicKey("SP12tWFxD9oJsVWNavTTBZvMbA6gkAmxtVgxdqvyvhY"), {
      filters: [
        {
          dataSize: 611, // number of bytes
        },
      ],
    })

  // get sanctum multiple validators stake pools (MVSP)
  const multipleValidatorStakePoolAccounts = await connection.getParsedProgramAccounts(new PublicKey("SPMBzsVUuoHA4Jm6KunbsotaahvVikZs1JyTW6iJvbn"), {
      filters: [
        {
          dataSize: 611, // number of bytes
        },
      ],
    })

  // join SVSP and MVSP and decode pool data
  const allValidatorStakePoolAccounts = [...singleValidatorStakePoolAccounts,...multipleValidatorStakePoolAccounts].map(poolAccount => decodeAccount("stakePoolPartial", poolAccount.account))

  // get sanctum LSTs mints
  const poolMints = allValidatorStakePoolAccounts.map(value => value.poolMint)

  // get LSTs inside Infinity
  const lstStateListAccount = await connection.getAccountInfo(
    new PublicKey("Gb7m4daakbVbrFLR33FKMDVMHAprRZ66CSYt4bpFwUgS")
  );

  // decode state list data and get Infinity LST mints
  const infinityLstsAccount = decodeAccount("sanctumValidatorLsts", lstStateListAccount);

  // filter out non-sanctum LSTs
  const sanctumDeployedLstsInfinity = infinityLstsAccount.filter(item => poolMints.find(mint => mint.equals(item.mint)));
  
  const totalSanctumDeployedLstsStake = allValidatorStakePoolAccounts.map(value => value.totalStakeLamports / 1e9).reduce((acc, curr) => acc + curr)
  const totalSanctumDeployedLstsInfinity = sanctumDeployedLstsInfinity.map(value => value.solValue / 1e9).reduce((acc, curr) => acc + curr)

  return {
    solana: totalSanctumDeployedLstsStake - totalSanctumDeployedLstsInfinity,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses GPA to fetch the total supply of deposited SOL into the various Sanctum LSTs",
  solana: {
    tvl,
  },
};
