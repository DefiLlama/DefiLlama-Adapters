// node test.js projects/mochifi/index.js
const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs');

async function ethereum(api) {
  const { vaults } = await getConfig('mochifi','https://backend.mochi.fi/vaults?chainId=1');

  const tokensAndOwners = vaults.map(i => ([i.tokenAddress, i.vaultAddress]))
  return sumTokens2({
    api,
    tokensAndOwners,
    blacklistedTokens: ['0x60ef10edff6d600cd91caeca04caed2a2e605fe5']
  })
}

module.exports = {
  methodology: "TVL counts collateral deposits to mint USDM",
  ethereum: {
    tvl: ethereum
  },
}
