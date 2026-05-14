const ADDRESSES = require('../helper/coreAssets.json')

// ClawdStrategy STRI token on Base.
// Each STRI is permanently minted at the immutable on-chain MINT_PRICE
// (50 USDC, 6 decimals) and represents capital under management by the
// protocol's AI trading agents. STRI itself is not redeemable for the
// underlying USDC — the deposited capital is deployed into income
// strategies that distribute Bitcoin (cbBTC) weekly to holders.
const STRI = '0x014b5195DF372AFF57D7182c2A0fd3b202F707c3'

async function tvl(api) {
  const [totalSupply, mintPrice] = await Promise.all([
    api.call({ abi: 'erc20:totalSupply', target: STRI }),
    api.call({ abi: 'uint256:MINT_PRICE', target: STRI }),
  ])
  // STRI has 18 decimals, MINT_PRICE returns USDC raw (6 decimals).
  // USDC equivalent (raw, 6 decimals) = totalSupply * MINT_PRICE / 1e18
  const usdcAmount = (BigInt(totalSupply) * BigInt(mintPrice)) / (10n ** 18n)
  api.add(ADDRESSES.base.USDC, usdcAmount.toString())
}

module.exports = {
  methodology:
    "TVL is calculated on-chain as STRI totalSupply() multiplied by the immutable MINT_PRICE() constant on the STRI contract (50 USDC, hardcoded in the smart contract). Each STRI token represents $50 of capital permanently committed to ClawdStrategy's AI income strategies on Base. Both values are read directly from the STRI contract at 0x014b5195DF372AFF57D7182c2A0fd3b202F707c3.",
  base: { tvl },
}
