const retry = require("../helper/retry");
const axios = require("axios");
const { BigNumber, utils } = require("ethers");

const tvl = async () => {
  const vault = await retry(
    async () => await axios.get("https://solana-vault.uc.r.appspot.com/tvl")
  );

  let vaultBalance = BigNumber.from(0);
  let queuedDeposits = BigNumber.from(0);
  let collateralBalance = BigNumber.from(0);

  if (vault.data) {
    vaultBalance = utils.parseUnits(vault.data.sol.vaultBalance, 9);
    queuedDeposits = utils.parseUnits(vault.data.sol.queuedDeposits, 9);
    collateralBalance = utils.parseUnits(vault.data.sol.collateralBalance, 9);
  }

  return {
    solana:
      parseInt(
        vaultBalance.add(queuedDeposits).add(collateralBalance).toString()
      ) /
      10 ** 9,
  };
};

module.exports = {
  solana: {
    tvl,
  },
};
