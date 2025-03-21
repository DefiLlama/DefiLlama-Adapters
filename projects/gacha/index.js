const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  abstract: {
    gacha: '0x3272596F776470D2D7C3f7dfF3dc50888b7D8967',
    fromBlock: 1476305,
  },
}

async function tvl(api) {
  const { gacha } = config[api.chain]

  const { currentPoolId } = await api.call({
    target: gacha,
    abi: 'function getConfig() view returns (tuple(uint256 currentSupply, uint256 currentPoolId, address owner, address uniswapRouter, address paymentToken, address entropy, address feeWallet, uint16 feeBPS, uint16 referralBPS, uint256 referralClaimThreshold))',
  })

  const tokens = [
    "0x3439153EB7AF838Ad19d56E1571FBD09333C2809", // weth
    "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1", // usdc
  ];

  for (let i = 1; i <= currentPoolId; i++) {
    const { token } = await api.call({
      target: gacha,
      abi: 'function getPool(uint256) view returns (tuple(uint256,uint256,uint256,address token,uint256,uint16,uint16[]))',
      params: [i],
    })
    tokens.push(token)
  }

  return sumTokens2({ api, owner: gacha, tokens })
}

module.exports = {
  methodology: 'TVL consists of total token balances held by the Gacha contract pools.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
