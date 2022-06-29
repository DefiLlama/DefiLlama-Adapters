const sdk = require("@defillama/sdk");
const { vaults, getTVLData, getVaultL1Funds } = require("../helper/brahmafi");
const { BigNumber } = require("ethers");

const MAX_BPS = 1e3;

const tvl = async (_, block) => {
  const { pendingDeposits, tokens, totalSupplies } = await getTVLData(block);

  const balances = {};

  for (const [idx, { address }] of vaults.entries()) {
    const wantToken = tokens[idx].output;
    const totalSupply = totalSupplies[idx].output;

    const totalFunds = await getVaultL1Funds(address, wantToken, block);
    const sharePrice = totalFunds.mul(MAX_BPS).div(totalSupply);

    const value = BigNumber.from(totalSupply)
      .mul(sharePrice)
      .div(MAX_BPS)
      .add(pendingDeposits[idx].output);
    const tokenBalance = balances[wantToken];

    balances[wantToken] = !!tokenBalance
      ? BigNumber.from(tokenBalance).add(value).toString()
      : value.toString();
  }

  console.log(balances);
};

module.exports = {
  methodology:
    "TVL is the total supply of our vault tokens, multiplied by their corresponding share price. The share price is calculated based on the value of positions taken by vaults both on ethereum and optimism networks",
  ethereum: {
    tvl,
  },
};
