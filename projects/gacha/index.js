const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  abstract: {
    gacha: '0x3272596F776470D2D7C3f7dfF3dc50888b7D8967',
    fromBlock: 1476305,
  },
}

const abi = {
  getConfig: 'function getConfig() view returns (tuple(uint256 currentSupply, uint256 currentPoolId, address owner, address uniswapRouter, address paymentToken, address entropy, address feeWallet, uint16 feeBPS, uint16 referralBPS, uint256 referralClaimThreshold))',
  getPools: 'function getPool(uint256) view returns (tuple(uint256,uint256,uint256,address token,uint256,uint16,uint16[]))',
}

async function tvl(api) {
  const { gacha } = config[api.chain]
  const { currentPoolId } = await api.call({ abi: abi.getConfig, target: gacha })
  const _tokens = await api.fetchList({ lengthAbi: abi.getConfig, itemAbi: abi.getPools, target: gacha, field: 'token', itemCount: currentPoolId, startFromOne: true, })

  const tokens = [
    ADDRESSES.abstract.WETH, // weth
    ADDRESSES.abstract.USDC, // usdc
  ];

  tokens.push(..._tokens)
  return api.sumTokens({ owner: gacha, tokens })
}

module.exports = {
  methodology: 'TVL consists of total token balances held by the Gacha contract pools.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
