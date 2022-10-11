const sdk = require('@defillama/sdk');
const { getChainTransform } = require('../helper/portedTokens');

const OCEAN_CONTRACT = '0xC32eB36f886F638fffD836DF44C124074cFe3584';
const DAI_CONTRACT = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';
const USDC_CONTRACT = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8';
const USDT_CONTRACT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
const WBTC_CONTRACT = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f';

const TOKEN_CONTRACTS = [
    DAI_CONTRACT,
    USDC_CONTRACT, 
    USDT_CONTRACT,
    WBTC_CONTRACT
]

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await getChainTransform('arbitrum');

  for(let i = 0; i < TOKEN_CONTRACTS.length; i++){
    const tokenBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: 'arbitrum',
        target: TOKEN_CONTRACTS[i],
        params: [OCEAN_CONTRACT],
        block: chainBlocks.arbitrum,
    })).output;

    sdk.util.sumSingleBalance(balances, transform(TOKEN_CONTRACTS[i]), tokenBalance)
  }

  const ethBalance = (await sdk.api.eth.getBalance({
    target: OCEAN_CONTRACT,
    chain: 'arbitrum'
  })).output

  sdk.util.sumSingleBalance(balances, "0x0000000000000000000000000000000000000000", ethBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: 'Sums up the value of all tokens wrapped into Shell v2',
  start: 24142587,
  arbitrum: {
      tvl
  },
  hallmarks: [
    [1662927378, "Shell v2 Launch"]
  ]
}; 