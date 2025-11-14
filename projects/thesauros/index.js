const config = {
  arbitrum: [
    '0x57C10bd3fdB2849384dDe954f63d37DfAD9d7d70', // tUSDC
  ]
};

const abi = "function getDepositBalance(address user, address vault) view returns (uint256 balance)";

module.exports = {
  methodology: "TVL displays the total amount of assets stored in the Thesauros contracts.",
  start: '2025-09-19',
  hallmarks: [[1758283200, "Protocol launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: (api) => tvl(api, config[chain]) };
});

const tvl = async (api, vaults) => {
  const [providers, assets] = await Promise.all([
    api.multiCall({ calls: vaults, abi: "address:activeProvider" }),
    api.multiCall({ calls: vaults, abi: "address:asset" }),
  ]);

  const balances = await api.multiCall({ calls: vaults.map((vault, i) => ({ target: providers[i], params: [vault, vault] })), abi })
  api.add(assets, balances)
};
