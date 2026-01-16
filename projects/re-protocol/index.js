const chains = ['ethereum', 'avax', 'arbitrum', 'base'];

// Token addresses per chain
const tokens = {
  ethereum: {
    reUSD: '0x5086bf358635B81D8C47C66d1C8b9E567Db70c72',
    reUSDe: '0xdDC0f880ff6e4e22E4B74632fBb43Ce4DF6cCC5a',
  },
  avax: {
    reUSD: '0x180aF87b47Bf272B2df59dccf2D76a6eaFa625Bf',
  },
  arbitrum: {
    reUSD: '0x76cE01F0Ef25AA66cC5F1E546a005e4A63B25609',
  },
  base: {
    reUSD: '0x7D214438D0F27AfCcC23B3d1e1a53906aCE5CFEa',
  },
};

// Off-chain reserves oracle on Avalanche
const ORACLE_ADDRESS = '0xc79a363a3f849d8b3F6A1932f748eA9d4fB2f607';

async function tvl(api) {
  const chainTokens = tokens[api.chain];

  // Track reUSD token supply
  if (chainTokens.reUSD) {
    const reUSDSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: chainTokens.reUSD,
    });
    api.add(chainTokens.reUSD, reUSDSupply);
  }

  // Track reUSDe token supply (Ethereum only)
  if (chainTokens.reUSDe) {
    const reUSDeSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: chainTokens.reUSDe,
    });
    api.add(chainTokens.reUSDe, reUSDeSupply);
  }

  // Track off-chain reserves via oracle (Avalanche only)
  if (api.chain === 'avax') {
    const latestAnswer = await api.call({
      abi: 'function latestAnswer() view returns (int256)',
      target: ORACLE_ADDRESS,
    });
    api.addUSDValue(Number(latestAnswer) / 1e8);
  }
}

module.exports = {
  methodology: 'TVL includes total supply of reUSD and reUSDe tokens across Ethereum, Avalanche, Arbitrum, and Base, plus off-chain reserves tracked via oracle on Avalanche.',
  start: 1680307200,
};

chains.forEach(chain => module.exports[chain] = { tvl });
