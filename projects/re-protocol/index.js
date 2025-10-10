const { get } = require('../helper/http');

// Supported chains
const chains = ["ethereum", "avax", "arbitrum", "base"];

// Token addresses per chain
const contracts = {
  ethereum: {
    reUSD: "0x5086bf358635B81D8C47C66d1C8b9E567Db70c72",
    reUSDe: "0xdDC0f880ff6e4e22E4B74632fBb43Ce4DF6cCC5a"
  },
  avax: {
    reUSD: "0x180aF87b47Bf272B2df59dccf2D76a6eaFa625Bf",
    latestAnswerContract: "0xc79a363a3f849d8b3F6A1932f748eA9d4fB2f607"
  },
  arbitrum: {
    reUSD: "0x76cE01F0Ef25AA66cC5F1E546a005e4A63B25609"
  },
  base: {
    reUSD: "0x7D214438D0F27AfCcC23B3d1e1a53906aCE5CFEa"
  }
};

async function tvl(api) {
  const config = contracts[api.chain];
  
  // Handle reUSD token (all chains)
  if (config.reUSD) {
    const reUSDSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: config.reUSD
    });
    api.add(config.reUSD, reUSDSupply);
  }
  
  // Handle reUSDe token (Ethereum only)
  if (config.reUSDe) {
    const reUSDeSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: config.reUSDe
    });
    api.add(config.reUSDe, reUSDeSupply);
  }
  
  // Handle Avalanche oracle reserves
  if (config.latestAnswerContract) {
    const latestAnswer = await api.call({
      abi: 'function latestAnswer() view returns (int256)',
      target: config.latestAnswerContract
    });
    api.addUSDValue(Number(latestAnswer) / 1e8);
  }
  
  // Handle premium receivables (Ethereum only, global attribution)
  if (api.chain === 'ethereum') {
    try {
      const response = await get('https://api.re.xyz/tvl/premium-receivables');
      api.addUSDValue(response.amount);
    } catch (e) {
      console.log('Premium receivables API failed:', e.message);
    }
  }
}

module.exports = {
  methodology: 'Counts total supply of reUSD and reUSDe tokens across Ethereum, Avalanche, Arbitrum, and Base, plus additional reserves from Avalanche oracle and insurance premium receivables via secure API. These represent user deposits in Re Protocol insurance capital layers. reUSD offers principal-protected fixed yield (~6-9% APY) while reUSDe provides variable yield exposure to reinsurance risks (~16-25% APY).',
  misrepresentedTokens: true, // Due to API usage for premium receivables
  start: 1680307200, // April 1, 2023 - approximate protocol launch
};

// Export TVL function for each supported chain
chains.forEach(chain => module.exports[chain] = { tvl });