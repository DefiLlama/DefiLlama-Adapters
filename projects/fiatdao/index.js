const { fetchURL } = require("../helper/utils");
const sdk = require("@defillama/sdk")
const abi = require('./abi.json');
const { default: BigNumber } = require("bignumber.js");

const LUSD = '0x5f98805a4e8be255a32880fdec7f6728c6568ba0'
const LUSD3CRV = '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA'

function resolveUnderlier(underlier) {
  if (underlier == LUSD3CRV) return LUSD
  return underlier
}

async function tvl(timestamp, block) {
  const balances = {};

  const metadata = Object.entries(
    (await fetchURL('https://raw.githubusercontent.com/fiatdao/changelog/main/metadata/metadata-mainnet.json')).data
  )

  await Promise.all(metadata.map(async ([vault, { tokenIds }]) => {
    const token = await sdk.api.abi.call({target: vault, block, abi: abi.token})
    if (token.output === '0x0000000000000000000000000000000000000000') return

    return Promise.all(tokenIds.map(async (tokenId) => {
      // ERC20 based vaults
      if (tokenId === '0') {
        // TODO: use multicall
        const tokenBalance = await sdk.api.erc20.balanceOf({target: token.output, owner: vault, block})
        const tokenScale = await sdk.api.abi.call({target:vault, block, abi: abi.tokenScale})
        const underlier = await sdk.api.abi.call({target:vault, block, abi: abi.underlierToken})
        const underlierScale = await sdk.api.abi.call({target:vault, block, abi: abi.underlierScale})
        const price = await sdk.api.abi.call({target:vault, block, abi: abi.fairPrice, params: [0, false, false]})

        sdk.util.sumSingleBalance(
          balances,
          resolveUnderlier(underlier.output),
          BigNumber(tokenBalance.output).times(underlierScale.output).div(tokenScale.output).times(price.output).div(1e18).toFixed(0)
        )
      // ERC1155 based vaults
      } else {
        // TODO: use multicall
        const tokenBalance = await sdk.api.abi.call({target: token.output, block, abi: abi.balanceOf, params: [vault, tokenId]})
        const tokenScale = await sdk.api.abi.call({target:vault, block, abi: abi.tokenScale})
        const underlier = await sdk.api.abi.call({target:vault, block, abi: abi.underlierToken})
        const underlierScale = await sdk.api.abi.call({target:vault, block, abi: abi.underlierScale})
        const price = await sdk.api.abi.call({target:vault, block, abi: abi.fairPrice, params: [tokenId, false, false]})
    
        sdk.util.sumSingleBalance(
          balances,
          resolveUnderlier(underlier.output),
          BigNumber(tokenBalance.output).times(underlierScale.output).div(tokenScale.output).times(price.output).div(1e18).toFixed(0)
        )
      }
    }))
  }))

  return balances
}

module.exports = {
  methodology: 'TVL includes fair value of collateral backing outstanding $FIAT',
  ethereum: { tvl }
}
