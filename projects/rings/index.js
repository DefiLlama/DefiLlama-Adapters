const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const config = {
  ethereum: {
    vaults: [
      '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
      '0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812',
    ],
    accountants: [
      '0xA76E0F54918E39A63904b51F688513043242a0BE',
      '0x3a592F9Ea2463379c4154d03461A73c484993668'
    ]
  },
  sonic: {
    vaults: [
      '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
      '0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812',
    ],
    accountants: [
      '0xA76E0F54918E39A63904b51F688513043242a0BE',
      '0x3a592F9Ea2463379c4154d03461A73c484993668'
    ]
  }
}

async function tvl(api) {
  for (const chain in config) {
    const chainApi = new sdk.ChainApi({ chain, timestamp: api.timestamp })

    const vaults = config[chain].vaults
    const accountants = config[chain].accountants

    // USDC vaults
    const rateUsd = await chainApi.call({
      target: accountants[0],
      abi: 'function getRate() view returns (uint256)'
    })
    const totalSupplyUsd = await chainApi.call({
      target: vaults[0],
      abi: 'function totalSupply() view returns (uint256)'
    })
    api.add(ADDRESSES.sonic["USDC_e"], BigInt(totalSupplyUsd) * BigInt(rateUsd) / BigInt(1e6))

    // WETH vaults
    const rateEth = await chainApi.call({
      target: accountants[1],
      abi: 'function getRate() view returns (uint256)'
    })
    const totalSupplyEth = await chainApi.call({
      target: vaults[1],
      abi: 'function totalSupply() view returns (uint256)'
    })
    api.add(ADDRESSES.sonic["WETH"], BigInt(totalSupplyEth) * BigInt(rateEth) / BigInt(1e18))
  }
}

module.exports = {
  sonic: {
    tvl,
  },
  methodology: 'TVL counts the tokens deposited in the boring vaults.',
  start: 1733726867
};