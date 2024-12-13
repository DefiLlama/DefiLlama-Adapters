const axios = require("axios");


async function fetchVaultInfo() {
    try {
        const response = await axios.get("https://vaults.theo.xyz/vaults/vaultInfo");
        return response.data
    } catch (error) {
        console.error("Error fetching vault info:", error);
        throw new Error("Failed to fetch vault info");
    }
}

async function tvlForChain(api, chainKey) {
  const vaultInfo = await fetchVaultInfo();
  const chainVaults = vaultInfo[chainKey];

  for (const [vaultAsset, vaultData] of Object.entries(chainVaults)) {
    const collateralBalance = await api.call({
      abi: "function totalBalance() public view returns (uint256)",
      target: vaultData.contract,
    });

    api.add(vaultData.asset, collateralBalance);
  }
}

async function eth_tvl(api) {
  await tvlForChain(api, "ethereum");
}

async function arb_tvl(api) {
  await tvlForChain(api, "arbitrum");
}

async function base_tvl(api) {
 await tvlForChain(api, "base");
}

module.exports = {
  ethereum: {
    tvl: eth_tvl,
  },
  arbitrum: {
    tvl: arb_tvl,
  },
  base: {
    tvl: base_tvl,
  }
};
