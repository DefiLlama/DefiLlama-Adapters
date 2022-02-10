const sdk = require("@defillama/sdk");
const { getBlock } = require('../helper/getBlock');
const BigNumber = require('bignumber.js');
const {transformOptimismAddress} = require('../helper/portedTokens')
const abi = require('./abi.json')

const KROM_mainnet = '0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789';
const contracts = {
  optimism: {
    KROM: '0xf98dcd95217e15e05d8638da4c91125e59590b07',
    position: '0x7314Af7D05e054E96c44D7923E68d66475FfaAb8'
  }
};

tvl = (chain) => async function (timestamp, ethBlock, chainBlocks) {
  const krom = contracts[chain].KROM;
  const krom_position = contracts[chain].position;
  
  let transform = id=>id;
  if(chain === "optimism"){
    transform = await transformOptimismAddress();
  } 

  // Get Kroma deposited by users to pay for their fees
  const block = await getBlock(timestamp, chain, chainBlocks, false);
  const {output: balance} = await sdk.api.erc20.balanceOf({
    target: krom,
    owner: krom_position,
    chain,
    block,
  });
  const balances = {};
  sdk.util.sumSingleBalance(balances, transform(krom), balance);

  // Get LP positions tokens owed
  const {output: positionsSupply} = await sdk.api.erc20.totalSupply({
    target: krom_position,
    chain,
    block,
  });
  const position_indices = Array.from(Array(parseInt(positionsSupply)).keys());
  const orders = await sdk.api.abi.multiCall({
    calls: position_indices.map(idx => ({
      target: krom_position,
      params: [idx]
    })),
    abi: abi['orders'],
    chain,
    block,
  });
  // Retrieve valid orders and add tokens owed to balances
  const valid_orders = orders.output
      .map(order => order.output)
      .filter(order => order);
  valid_orders.forEach(order => {
    sdk.util.sumSingleBalance(balances, transform(order.token0), order.tokensOwed0);
    sdk.util.sumSingleBalance(balances, transform(order.token1), order.tokensOwed1);
  });
  console.log('Kroma positions count', valid_orders.length)

  return balances;
}

module.exports = {
  methodology: "Kromatika handles Uniswap-v3 positions for their users who submit limit orders - TVL is amounts of tokens of each LP as well as KROM held by the contract to pay for fees",
  optimism: {
    tvl: tvl('optimism')
  }
};

// UniswapV3Pool NonfungiblePositionManager has a low level mint method
// this is what UniswapNFT uses and Kromatikaa is also using it; so in a way Kromatika is a different NFT LP manager for UniswapV3 but for limit orders
// users gets Kromatika NFT for their limit position;  same as they get Uniswap NFT for their LP; so it is a similar impl from Uniswap, but extended to support limit orders 