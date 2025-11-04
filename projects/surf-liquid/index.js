const target = "0x1D283b668F947E03E8ac8ce8DA5505020434ea0E";

module.exports = {
  methodology: "Counts the morpho deposits of each Surf Liquid vault.",
  base: {
    tvl: async (api) => {
      const vaults = await api.call({ abi: "uint256:getTotalVaults", target });
      const vaultInfos = await api.multiCall({
        abi: "function getVaultInfo(uint256) view returns (address, address, address, uint256, bytes32, uint256)",
        calls: [...Array(Number(vaults)).keys()].map((i) => ({ target, params: [i] })),
      });
      const owners = vaultInfos.map(info => info[0])
      const morphoVaults = await api.multiCall({
        abi: "address:currentVault",
        calls: owners.map(target => ({ target }))
      })

      await api.sumTokens({
        tokens: [...new Set(morphoVaults)],
        owners
      })
    },
  },
};
