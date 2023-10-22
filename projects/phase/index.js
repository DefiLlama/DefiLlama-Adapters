const sdk = require("@defillama/sdk");
const config = require("./config");

async function tvl(timestamp, block, chainBlocks, { api }) {
  const { vaults } = config[api.chain];

  for (const vault of vaults) {
    const asset = await api.call({
      abi: "function asset() external view returns (address)",
      target: vault,
    });

    const collateralBalance = await api.call({
      abi: "function collectiveCollateral() external view returns (uint256)",
      target: vault,
    });

    api.add(asset, collateralBalance);
  }
}

async function borrowed(timestamp, block, chainBlocks, { api }) {
  const { vaults, cash } = config[api.chain];
  const balances = {};

  for (const vault of vaults) {
    const totalBorrowed = await api.call({
      abi: "function collectiveDebt() external view returns (uint256)",
      target: vault,
    });

    sdk.util.sumSingleBalance(balances, cash, totalBorrowed);
  }

  return balances;
}

async function staking(timestamp, block, chainBlocks, { api }) {
  const { cash, bond } = config[api.chain];

  const totalBonded = await api.call({
    abi: "erc20:balanceOf",
    target: cash,
    params: [bond],
  });

  return {
    [cash]: totalBonded,
  };
}

module.exports = {
  timetravel: true,
  methodology:
    "Counts the TVL of the Phase vaults. Counts total borrows. Counts $CASH in the bond.",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
    borrowed,
    staking,
  };
});
