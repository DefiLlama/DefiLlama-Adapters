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

  const metadata = (await fetchURL('https://raw.githubusercontent.com/fiatdao/changelog/main/metadata/metadata-mainnet.json')).data
  const allVaults = Object.keys(metadata)
  const { output: tokensAll } = await sdk.api.abi.multiCall({ abi: abi.token, calls: allVaults.map(i => ({ target: i })), block, })
  const tokens = []
  const vaults = []

  tokensAll.forEach(({ output, input: { target } }) => {
    if (output !== '0x0000000000000000000000000000000000000000') {
      vaults.push(target)
      tokens.push(output)
    }
  })

  const vaultCalls = vaults.map(i => ({ target: i }))
  const { output: tokenScales } = await sdk.api.abi.multiCall({ abi: abi.tokenScale, calls: vaultCalls, block, })
  const { output: underliers } = await sdk.api.abi.multiCall({ abi: abi.underlierToken, calls: vaultCalls, block, })
  const { output: underlierScales } = await sdk.api.abi.multiCall({ abi: abi.underlierScale, calls: vaultCalls, block, })

  const erc20Metadata = []
  const erc1155Metadata = []

  underliers.forEach(({ output: token, input: { target: vault } }, i) => {
    const underlier = resolveUnderlier(token)
    const scale = BigNumber(underlierScales[i].output / (tokenScales[i].output * 1e18))
    metadata[vault].tokenIds.forEach(id => {
      if (id === '0') {
        erc20Metadata.push({ vault, scale, underlier, tokenCall: { target: tokens[i], params: vault }, priceCall: { target: vault, params: [0, false, false] } })
        return;
      }
      erc1155Metadata.push({ vault, scale, underlier, tokenCall: { target: tokens[i], params: [vault, id] }, priceCall: { target: vault, params: [id, false, false] } })
    })
  })

  const { output: erc20Balances } = await sdk.api.abi.multiCall({ abi: 'erc20:balanceOf', calls: erc20Metadata.map(i => i.tokenCall), block, })
  const { output: erc20Prices } = await sdk.api.abi.multiCall({ abi: abi.fairPrice, calls: erc20Metadata.map(i => i.priceCall), block, })
  const { output: erc1155Balances } = await sdk.api.abi.multiCall({ abi: abi.balanceOf, calls: erc1155Metadata.map(i => i.tokenCall), block, })
  const { output: erc1155Prices } = await sdk.api.abi.multiCall({ abi: abi.fairPrice, calls: erc1155Metadata.map(i => i.priceCall), block, })

  erc20Balances.forEach(({ output, }, i) => {
    sdk.util.sumSingleBalance(balances, erc20Metadata[i].underlier, erc20Metadata[i].scale.times(output).times(erc20Prices[i].output).toFixed(0))
  })

  erc1155Balances.forEach(({ output, }, i) => {
    sdk.util.sumSingleBalance(balances, erc1155Metadata[i].underlier, erc1155Metadata[i].scale.times(output).times(erc1155Prices[i].output).toFixed(0))
  })

  return balances
}

module.exports = {
  methodology: 'TVL includes fair value of collateral backing outstanding $FIAT',
  ethereum: { tvl }
}
