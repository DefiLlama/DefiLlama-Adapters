const VAULTS = {
  hyperliquid: {
    hbHYPE: {
      vault: '0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB', // hbHYPE
      underlying: '0x5555555555555555555555555555555555555555', // WHYPE
    }
  },
  ethereum: {
    hypereth: {
      vault: '0x9E3C0D2D70e9A4BF4f9d5F0A6E4930ce76Fed09e', // hypeETH
      underlying: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    },
    hyperbtc: {
      vault: '0x9920d2075A350ACAaa4c6D00A56ebBEeD021cD7f', // hypeBTC
      underlying: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    },
    hyperusd: {
      vault: '0x340116F605Ca4264B8bC75aAE1b3C8E42AE3a3AB', // hypeUSD
      underlying: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    }
  }
};

async function calculateVaultTvl(api, vaultConfigs) {
  const vaultAddresses = vaultConfigs.map(c => c.vault);
  const underlyingTokens = vaultConfigs.map(c => c.underlying);

  const totalSupplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: vaultAddresses,
    permitFailure: true,
  });

  totalSupplies.forEach((balance, i) => {
    if (balance !== null) {
      api.add(underlyingTokens[i], balance);
    }
  });
}

const chainExports = {};
for (const chain in VAULTS) {
  chainExports[chain] = {
    tvl: (api) => calculateVaultTvl(api, Object.values(VAULTS[chain]))
  };
}

module.exports = {
  methodology: 'Calculates TVL by using the totalSupply of each vault token (hbHYPE, hypeETH, hypeBTC, hypeUSD) as the direct measure of the underlying asset (WHYPE, WETH, WBTC, USDC).',
  start: 1738368000,
  ...chainExports
};
