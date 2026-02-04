const LATEST_PRICE_ABI = 'function getCoinPrice(uint256, address, address) external view returns (bool, uint256)';

async function tvl(api) {
  const { factory, oracle } = config[api.chain];

  // Get token list from factory
  const tokens = await api.call({
    abi: 'function generalTokenList() external view returns (address[])',
    target: factory,
  });

  // Get total supplies for all tokens
  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: tokens,
  });

  // Get decimals for all tokens
  const decimals = await api.multiCall({
    abi: 'erc20:decimals',
    calls: tokens,
  });

  // Get prices from oracle for each token (price has 18 decimals)
  const prices = await api.multiCall({
    abi: LATEST_PRICE_ABI,
    target: oracle,
    calls: tokens.map((token) => ({
      params: [840, token, '0x0000000000000000000000000000000000000000'],
    })),
  });

  tokens.forEach((token, idx) => {
    const [, price] = prices[idx];
    const priceBN = BigInt(price || 0);
    
    // Skip tokens with zero price (no TVL contribution)
    if (priceBN > 0n) {
      const supplyBN = BigInt(supplies[idx]);
      const tokenDecimals = Number(decimals[idx]);
      // TVL in USD = (supply / 10^tokenDecimals) * (price / 10^18)
      const divisor = 10n ** BigInt(tokenDecimals + 18);
      const usdValue = Number(supplyBN * priceBN / divisor);
      api.addUSDValue(usdValue);
    }
  });
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Total Supply of all security tokens issued by Stobox multiplied by the current price of all assets.`,
};

const config = {
  arbitrum: {
    oracle: '0x7C48bb52E63fe34C78F0D14Ee6E59BDe95D93645',
    factory: '0x096D75d0501c3B1479FFe15569192CeC998223b4',
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
