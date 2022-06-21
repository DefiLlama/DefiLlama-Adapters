const sdk = require("@defillama/sdk")
const { getChainTransform } = require('../helper/portedTokens')
const abi = require('./abi.json')

const contracts = {
  optimism: {
    KROM: '0xf98dcd95217e15e05d8638da4c91125e59590b07',
    position: '0x7314Af7D05e054E96c44D7923E68d66475FfaAb8'
  },
  ethereum: {
    KROM: '0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789',
    position: '0xd1fdf0144be118c30a53e1d08cc1e61d600e508e'
  },
  arbitrum: {
    KROM: '0x55ff62567f09906a85183b866df84bf599a4bf70',
    position: '0x02C282F60FB2f3299458c2B85EB7E303b25fc6F0'
  }
};

const tvl = (chain) => async function (timestamp, ethBlock, chainBlocks) {
  const krom_position = contracts[chain].position;

  let transform = await getChainTransform(chain);
  const block = chainBlocks[chain]
  const balances = {};

  // Get LP positions tokens owed
  const { output: positionsSupply } = await sdk.api.erc20.totalSupply({ target: krom_position, chain, block, });
  const position_indices = Array.from(Array(parseInt(positionsSupply)).keys());
  const calls = position_indices.map(idx => ({ target: krom_position, params: [idx] }))
  const tokenIds = await sdk.api.abi.multiCall({ calls, abi: abi['tokenByIndex'], chain, block, });
  const tokenCalls = tokenIds.output.map(idx => ({ target: krom_position, params: [idx.output] }))
  const orders = await sdk.api.abi.multiCall({ calls: tokenCalls, abi: abi['orders'], chain, block, });
  // Retrieve valid orders and add tokens owed to balances
  const valid_orders = orders.output
    .map(order => order.output)
  
  valid_orders.forEach(order => {
    sdk.util.sumSingleBalance(balances, transform(order.token0), order.tokensOwed0);
    sdk.util.sumSingleBalance(balances, transform(order.token1), order.tokensOwed1);
  });

  return balances;
}

const staking = (chain) => async function (timestamp, ethBlock, chainBlocks) {
  const krom = contracts[chain].KROM;
  const krom_position = contracts[chain].position;

  let transform = await getChainTransform(chain);
  const block = chainBlocks[chain]

  // Get Kroma deposited by users to pay for their fees
  const { output: balance } = await sdk.api.erc20.balanceOf({ target: krom, owner: krom_position, chain, block, });
  const balances = {};
  sdk.util.sumSingleBalance(balances, transform(krom), balance);

  return balances;
}

module.exports = {
  methodology: "Kromatika handles Uniswap-v3 positions for their users who submit limit orders - TVL is amounts of tokens of each LP as well as KROM held by the contract to pay for fees",
  optimism: {
    tvl: tvl('optimism'),
    staking: staking('optimism'),
  },
  arbitrum: {
    // tvl: tvl('arbitrum'),
    staking: staking('arbitrum'),
  },
  // ethereum: {
  //   tvl: tvl('ethereum')
  // }
}
// UniswapV3Pool NonfungiblePositionManager has a low level mint method
// this is what UniswapNFT uses and Kromatikaa is also using it; so in a way Kromatika is a different NFT LP manager for UniswapV3 but for limit orders
// users gets Kromatika NFT for their limit position;  same as they get Uniswap NFT for their LP; so it is a similar impl from Uniswap, but extended to support limit orders 