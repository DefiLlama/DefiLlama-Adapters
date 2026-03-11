const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs');

const mochiVault = "0x96076026Ae262f1D6a9b88BE49BBa0e8A80367EF"
const abi = { getVault: "function getVault(address _asset) view returns (address)" }

async function tvl(api) {
  const { vaults: rawTokens } = await getConfig('mochifi','https://backend.mochi.fi/vaults?chainId=1');
  const tokens = rawTokens.map(({ tokenAddress }) => tokenAddress)
  const vaults = await api.multiCall({ calls: tokens.map((t) => ({ target: mochiVault, params: [t] })), abi: abi.getVault })
  const tokensAndOwners = tokens.map((t, i) => ([t, vaults[i]]))
  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: ['0x60ef10edff6d600cd91caeca04caed2a2e605fe5']})
}

module.exports = {
  methodology: "TVL counts collateral deposits to mint USDM",
  ethereum: { tvl },
}
