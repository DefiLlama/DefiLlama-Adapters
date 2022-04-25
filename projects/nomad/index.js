// proxy contract:
//     https://github.com/nomad-xyz/configuration/blob/main/configs/production.json
// token holdings:
//     https://etherscan.io/tokenholdings?a=PUT CONTRACT ADDRESS HERE

const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");
const { chainExports } = require("../helper/exports");

const HOME_CHAINS = {
  'ethereum': '0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3', 
  'moonbeam': '0xD3dfD3eDe74E0DCEBC1AA685e151332857efCe2d', 
  'milkomeda': '0x9faF7f27c46ACdeCEe58Eb4B0Ab6489E603EC251'
};

const TOKEN_ADDRESSES = [
  {
    // FRAX
    'ethereum': '0x853d955aCEf822Db058eb8505911ED77F175b99e'
  },
  {
    // USDC
    'ethereum': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  {
    // DAI
    'ethereum': '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  },
  {
    // USDT
    'ethereum': '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  {
    // FXS
    'ethereum': '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'
  },
  {
    // WETH
    'ethereum': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  {
    // WBTC
    'ethereum': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  },
  {
    // IAG
    'ethereum': '0x40EB746DEE876aC1E78697b7Ca85142D178A1Fc8'
  },
  {
    // CQT
    'ethereum': '0xD417144312DbF50465b1C641d016962017Ef6240'
  }
];

function tvl(chain) {
  return async (time, _, chainBlocks) => {
    const balances = {};
    const block = await getBlock(time, chain, chainBlocks, true);
    // console.log(block);
  
    await Promise.all(
      TOKEN_ADDRESSES.map(async (token) => {
        const target = token[chain];

        if (target != undefined) {
          const owner = HOME_CHAINS[chain];
          
          const tokenBalance = await sdk.api.erc20.balanceOf({
            chain,
            block,
            target,
            owner,
          });

          // console.log(tokenBalance.output);

          await sdk.util.sumSingleBalance(balances, target, tokenBalance.output);

          // console.log(balances);
        }
      })
    );
    
    return balances;
  }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the total amount of assets locked in the Nomad token bridge.',
  start: 13983843,
  ...chainExports(tvl, Object.keys(HOME_CHAINS))
}; 
