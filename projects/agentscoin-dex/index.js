const { getUniTVL } = require('../helper/unknownTokens')

// AgentsCoin DEX - Uniswap V2 fork on AgentsCoin (EVM L1, chainId 24368)
// https://agents-coin.com  |  explorer: https://explorer.agents-coin.com
module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is the value of tokens locked in every AGENT-paired liquidity pool on the AgentsCoin DEX (a Uniswap V2 fork), read directly from the factory on-chain.',
  agentscoin: {
    tvl: getUniTVL({
      factory: '0x4Cd52B1E022Ef78B66862502cA4c000a15Adc06C',
      chain: 'agentscoin',
      coreAssets: ['0xF28A7ee0A7692D12C61210bA7477ff29e12d5BD8'], // WAGENT (wrapped native)
    }),
  },
}
