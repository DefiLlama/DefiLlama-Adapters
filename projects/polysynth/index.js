const sdk = require("@defillama/sdk");
const { transformPolygonAddress } = require('../helper/portedTokens');
const totalBalanceABI = require('./vault.json')

const insuranceFund = "0x809F76d983768846acCbD8F8C9BDc240dC39bf8B"
const manager = "0xeC5ae95D4e9288a5C7c744F278709C56e9dC34eD"
const usdcMatic = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const wethMatic = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
const wbtcMatic = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"
const stakingAddress = "0xb88cc657d93979495045e9f204cec2eed265ed42"
const usdcAssetVaults = [
  "0x26dde715023d8acb57f6702731b569c160e2a3fb",
  "0xAefA2EF8c02e39DAA310F5CAdAE3a35B198ff38B"
]

const ethAssetVaults = [
  "0xBbC6561d382bC45d81Fdb3581D76047f15825D53"
]

const btcAssetVaults = [
  "0x3728afb2dab6A6D0507f5536F9601F0956154355"
]

//ETH mainnet
const wethMainnet = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const wbtcMainnet = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
const usdcMainnet = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const ethAssetVaultsMainnet = [
  "0x8c6b3A5f9E7A92fe631Ac6EEc68d507Ee2AC7eA2"
]
const btcAssetVaultsMainnet = [
  "0xBbC6561d382bC45d81Fdb3581D76047f15825D53"
]
const usdcAssetVaultsMainnet = [
  "0x2d2ac1edaf20C1f34A153167E62D1A41F11Ad940",
  "0x16b9f400192dc0809431219EeBB38650b980A11F"
]


async function tvl(_timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const transformAddress = await transformPolygonAddress()
  const usdc = transformAddress(usdcMatic);
  const weth = transformAddress(wethMatic);
  const wbtc = transformAddress(wbtcMatic);

  //TVL for Perpetuals
  const underlyingBalances = await sdk.api.abi.multiCall({
    calls: [{
      target: usdcMatic,
      params: insuranceFund
    }, {
      target: usdcMatic,
      params: manager
    }, {
      target: usdcMatic,
      params: stakingAddress
    }],
    block: chainBlocks.polygon,
    abi: "erc20:balanceOf",
    chain: 'polygon'
  });

  underlyingBalances.output.forEach((ub) => {
    sdk.util.sumSingleBalance(balances, usdc, ub.output)
  })


  //TVL for USDC DOV vaults
  const totalBalances = await sdk.api.abi.multiCall({
    calls: usdcAssetVaults.map((address) => ({
      target: address
    })),
    abi: totalBalanceABI['totalBalance'],
    block: chainBlocks.polygon,
    chain: 'polygon'
  })

  totalBalances.output.forEach((totalBalanceVault) => {
    sdk.util.sumSingleBalance(balances, usdc, totalBalanceVault.output)
  })

  //TVL for ETH DOV vaults
  const totalBalancesETH = await sdk.api.abi.multiCall({
    calls: ethAssetVaults.map((address) => ({
      target: address
    })),
    abi: totalBalanceABI['totalBalance'],
    block: chainBlocks.polygon,
    chain: 'polygon'
  })

  totalBalancesETH.output.forEach((totalBalanceVault) => {
    sdk.util.sumSingleBalance(balances, weth, totalBalanceVault.output)
  })

  //TVL for BTC DOV vaults
  const totalBalancesBTC = await sdk.api.abi.multiCall({
    calls: btcAssetVaults.map((address) => ({
      target: address
    })),
    abi: totalBalanceABI['totalBalance'],
    block: chainBlocks.polygon,
    chain: 'polygon'
  })

  totalBalancesBTC.output.forEach((totalBalanceVault) => {
    sdk.util.sumSingleBalance(balances, wbtc, totalBalanceVault.output)
  })

  return balances
}

async function ethTVL(ts, ethBlock) {
  const balances = {};

  //TVL for ETH DOV vaults
  const totalBalancesETH = await sdk.api.abi.multiCall({
    calls: ethAssetVaultsMainnet.map((address) => ({
      target: address
    })),
    abi: totalBalanceABI['totalBalance'],
    block: ethBlock
  })

  totalBalancesETH.output.forEach((totalBalanceVault) => {
    sdk.util.sumSingleBalance(balances, wethMainnet, totalBalanceVault.output)
  })

  //TVL for USDC DOV vaults
  const totalBalances = await sdk.api.abi.multiCall({
    calls: usdcAssetVaultsMainnet.map((address) => ({
      target: address
    })),
    abi: totalBalanceABI['totalBalance'],
    block: ethBlock
  })

  totalBalances.output.forEach((totalBalanceVault) => {
    sdk.util.sumSingleBalance(balances, usdcMainnet, totalBalanceVault.output)
  })

  //TVL for BTC DOV vaults
  const totalBalancesBTC = await sdk.api.abi.multiCall({
    calls: btcAssetVaultsMainnet.map((address) => ({
      target: address
    })),
    abi: totalBalanceABI['totalBalance'],
    block: ethBlock
  })

  totalBalancesBTC.output.forEach((totalBalanceVault) => {
    sdk.util.sumSingleBalance(balances, wbtcMainnet, totalBalanceVault.output)
  })

  return balances
}

module.exports = {
  ethereum: {
    tvl: ethTVL
  },
  polygon: {
    tvl: tvl
  }
}