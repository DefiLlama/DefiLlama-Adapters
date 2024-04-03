const sdk = require("@defillama/sdk");

const facades = {
  polygon: "0x0708542D895C2559001Fa9e4Bc49C3343735e6e2",
  arbitrum: "0xE75254f298a5145438595Aa9d6D4327fCD14418D",
  bsc: "0xD187937762c6fd4d7a58C71fD810CbfE22E64a84",
  optimism: "0x285cAee14514f30bB178FB56c985e43A47d68E75",
};

async function tvl(api) {
  const vaults = await api.call({
    abi: "function getVaults() external view returns (address[] memory)",
    target: facades[api.chain],
  });

  const balances = {};
  const tokens = await api.multiCall({
    abi: "address:token",
    calls: vaults,
  });

  const totalBalance = await api.multiCall({
    abi: "function getVaultValueLocked(address _vault) external view returns (uint256)",
    calls: vaults.map((address) => ({
      target: facades[api.chain],
      params: [address],
    })),
    chain: api.chain,
  });

  tokens.forEach((t, i) =>
    sdk.util.sumSingleBalance(balances, t, totalBalance[i], api.chain)
  );
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: tvl,
  },
  optimism: {
    tvl: tvl,
  },
  polygon: {
    tvl: tvl,
  },
  bsc: {
    tvl: tvl,
  },
  methodology: "TVL is counted from the LuxsFi vaults contracts",
};