const ADDRESSES = require('../helper/coreAssets.json')

const IUSPC = '0xdc807c3a618B6B1248481783def7ED76700B9eC6'
const USPC_NAV_FEED = '0x02ae69C812DD749c32afb4F1723F6833EeF3d7a3'

async function tvl(api) {
  const [supply, price, priceDecimals] = await Promise.all([
    api.call({ target: IUSPC, abi: 'erc20:totalSupply' }),
    api.call({ target: USPC_NAV_FEED, abi: 'int256:latestAnswer' }),
    api.call({ target: USPC_NAV_FEED, abi: 'uint8:decimals' }),
  ])
  if (BigInt(price) <= 0n) throw new Error('Invalid USPC NAV from Chainlink feed')
  const value = (BigInt(supply) * BigInt(price)) / 10n ** BigInt(priceDecimals)
  api.add(ADDRESSES.ethereum.USDC, value.toString())
}

module.exports = {
  methodology:
    "TVL is the iUSPC supply valued at NAV: iUSPC.totalSupply() multiplied by the Chainlink USPC NAV feed (uspc-nav.data.eth), reported as USDC. The USPC ERC-4626 vault wraps iUSPC 1:1, so its assets are already counted inside iUSPC.totalSupply().",
  ethereum: { tvl },
}
