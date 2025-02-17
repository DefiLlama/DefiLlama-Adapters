const config = {
  arbitrum: [
    '0x2469c01daf31b68603Bd57E2FFf75E548223EA17', // rUSDT
    '0xff76d3942FeFc1FBD4577D812AB0fb453499a6a7', // rUSDC
    '0x0d8A44C8D028914a87ea465150fC3C093b3a80d3', // rUSDC.e
    '0x4Df2819f3c8f0e42E207Cc185Bea35BDe2090eCd', // rWETH
    '0x0d4AE20e4Aba5fB630bD83f089Ee62CCe904da8f', // rDAI
    '0x6A7F122d54925A5D16937e140baB42ff8C649fe7', // rFRAX
  ],
};

const abi = "function getDepositBalance(address user, address vault) view returns (uint256 balance)";

module.exports = {
  methodology: "TVL displays the total amount of assets stored in the REBALANCE vault contracts.",
  start: '2024-04-03',
  hallmarks: [[1712143874, "Profitable vaults deployment"]],
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
