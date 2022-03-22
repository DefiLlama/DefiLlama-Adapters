const sdk = require('@defillama/sdk');
// const { transformBscAddress } = require('../helper/portedTokens');
const NOMAD_ETH_BRIDGE_CONTRACT = '0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3';

const HOME_CHAINS = ['ethereum'];

const TOKEN_ADDRESSES = {
    'ethereum': [
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' //USDC
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
