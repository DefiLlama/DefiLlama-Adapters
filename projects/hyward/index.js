const ADDRESSES = {
  HYBRA_MANAGER: "0x08BD4336ae847169034fA8bd54265E90A531031F",
  HYBRA_BASE_TOKEN: "0x067b0C72aa4C6Bd3BFEFfF443c536DCd6a25a9C8",
  KITTEN_MANAGER: "0x88200D47928cF032a368A304f688C62036C07439",
  KITTEN_BASE_TOKEN: "0x618275F8EFE54c2afa87bfB9F210A52F0fF89364",
};

const getAllVaultsABI =
  "function getAllVaults() view returns (tuple(uint256 id, address vault, uint256 veTokenId, string name, uint8 vaultType, address targetToken, bool active)[])";

async function tvl(api) {
  const managers = [
    { addr: ADDRESSES.HYBRA_MANAGER, token: ADDRESSES.HYBRA_BASE_TOKEN },
    { addr: ADDRESSES.KITTEN_MANAGER, token: ADDRESSES.KITTEN_BASE_TOKEN },
  ];

  for (const { addr, token } of managers) {
    const vaults = await api.call({ abi: getAllVaultsABI, target: addr });

    const activeVaults = vaults.filter((v) => v.active);
    if (activeVaults.length === 0) continue;

    const assets = await api.multiCall({
      abi: "uint256:totalAssets",
      calls: activeVaults.map((v) => v.vault),
    });

    assets.forEach((amount) => api.add(token, amount));
  }
}

module.exports = {
  methodology:
    "TVL is calculated by summing the locked veNFT assets (totalAssets) across all active vaults in the Hyward protocol. Hyward manages ve(3,3) auto-voting delegation for Hybra and Kitten on HyperEVM.",
  hyperliquid: { tvl },
};
