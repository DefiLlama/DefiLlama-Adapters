const { vaults, getTVLData, getVaultL1Funds } = require("./helper");
const MAX_BPS = 1e3;
const sdk = require('@defillama/sdk')

const tvl = async (_, block) => {
  const { pendingDeposits, tokens, totalSupplies } = await getTVLData(block);

  const balances = {};

  for (const [idx, { address }] of vaults.entries()) {
    const wantToken = tokens[idx].output;
    const totalSupply = totalSupplies[idx].output;

    const totalFunds = await getVaultL1Funds(address, wantToken, block);
    const sharePrice = totalFunds * MAX_BPS / totalSupply;

    const value = totalSupply * sharePrice / MAX_BPS + +pendingDeposits[idx].output
    console.log(value, value.toFixed(0))
    sdk.util.sumSingleBalance(balances, wantToken, value.toFixed(0))
  }

  return balances
};

module.exports = {
  methodology:
    "TVL is the total supply of our vault tokens, multiplied by their corresponding share price. The share price is calculated based on the value of positions taken by vaults both on ethereum and optimism networks",
  ethereum: {
    tvl,
  },
};
