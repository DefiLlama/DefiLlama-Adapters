const sdk = require('@defillama/sdk');
// const { transformBscAddress } = require('../helper/portedTokens');
const NOMAD_ETH_BRIDGE_CONTRACT = '0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3';

const HOME_CHAINS = ['ethereum'];

const TOKEN_ADDRESSES = {
    'ethereum': [
      '0x853d955aCEf822Db058eb8505911ED77F175b99e', //FRAX
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', //USDC
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', //DAI
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', //UST
      '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', //FXS
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', //WETH
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', //WBTC
    ]
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  console.log(block);
  
  // const block = await getBlock(timestamp, 'ethereum', chainBlocks, true);
 
  await Promise.all(
    HOME_CHAINS.map(async (chain) => {
      await Promise.all(
        TOKEN_ADDRESSES[chain].map(async (target) => {
          const tokenBalance = await sdk.api.erc20.balanceOf({
            chain,
            block,
            target,
            owner: NOMAD_ETH_BRIDGE_CONTRACT,
          });

          await sdk.util.sumSingleBalance(balances, target, tokenBalance.output);
        })
      ) 
    })
  
    // let tokenAddress;
    // // Use the Ethereum address if possible.
    // // Also do special handling for tokens with different decimals on some chains.
    // if (token.coingecko) {
    //   // Some tokens don't have the Ethereum address registered on Coingecko.
    //   tokenAddress = token.coingecko;
    // } else if (
    //   (!token.ethereum ||
    //     (tokensWithDifferentDecimals.includes(token.ethereum) &&
    //       chainsWithDifferentDecimals.includes(chain))) &&
    //   chainToCoingeckoId[chain]
    // ) {
    //   tokenAddress = chain + ":" + token[chain];
    // } else {
    //   tokenAddress = token.ethereum;
    // }
  
  )
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the total amount of assets locked in the Nomad token bridge.',
  start: 13983843,
  ethereum: {
    tvl,
  }
}; 
