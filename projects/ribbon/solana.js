const retry = require("../helper/retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");

const tvl = async () => {
  const vault = await retry(
    async () => await axios.get("https://solana-vault.uc.r.appspot.com/tvl")
  );

  let vaultBalance = 0;
  let queuedDeposits = 0;
  let collateralBalance = 0;

  if (vault.data) {
    vaultBalance = vault.data.sol.vaultBalance;
    queuedDeposits = vault.data.sol.queuedDeposits;
    collateralBalance = vault.data.sol.collateralBalance;
  }

  return {
    solana: new BigNumber(vaultBalance)
      .plus(new BigNumber(queuedDeposits))
      .plus(new BigNumber(collateralBalance)),
  };
};

module.exports = {
  solana: {
    tvl,
  },
};
