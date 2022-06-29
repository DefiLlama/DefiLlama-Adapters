const sdk = require("@defillama/sdk");
const { vaults, getTVLData } = require("../helper/brahmafi");
const { BigNumber } = require("ethers");

const tvl = async (_, block) => {
  const { pendingDeposits, tokens, totalSupplies } = await getTVLData(block);

  const balances = {};

  vaults.forEach((_, idx) => {
    const value = BigNumber.from(totalSupplies[idx].output).add(
      BigNumber.from(pendingDeposits[idx].output)
    );
    const tokenBalance = balances[tokens[idx].output];

    balances[tokens[idx].output] = !!tokenBalance
      ? BigNumber.from(tokenBalance).add(value).toString()
      : value.toString();
  });

  console.log(balances);
};

(async () => await tvl(123123, 15044642))();

module.exports = {
  methodology:
    "TVL is the total supply of our vault tokens, multiplied by their corresponding share price. The share price is calculated based on the value of positions taken by vaults both on ethereum and optimism networks",
  ethereum: {
    tvl,
  },
};
