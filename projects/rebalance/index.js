const config = {
  arbitrum: [
    "0xCF86c768E5b8bcc823aC1D825F56f37c533d32F9", // rUSDT
    "0x6eAFd6Ae0B766BAd90e9226627285685b2d702aB", // rUSDC
    "0xa8aae282ab2e57B8E39ad2e70DA3566d315348A9", // rUSDC.e
    "0xcd5357A4F48823ebC86D17205C12B0B268d292a7", // rWETH
    "0x5A0F7b7Ea13eDee7AD76744c5A6b92163e51a99a", // rDAI
    "0x3BCa6513BF284026b4237880b4e4D60cC94F686c", // rFRAX
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
