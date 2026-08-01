const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const { sumTokensExport } = require('../helper/unwrapLPs');

// Ribbon Earn vaults
const rearnUSDC = "0x84c2b16FA6877a8fF4F3271db7ea837233DFd6f0";
const rearnstETH = "0xCE5513474E077F5336cf1B33c1347FDD8D48aE8c";

const tokensAndOwners = [
  [ADDRESSES.ethereum.USDC, rearnUSDC],
  [ADDRESSES.ethereum.STETH, rearnstETH],
]

async function borrowed(api) {
  const cloneApi = new sdk.ChainApi({ block: api.block, chain: api.chain });
  await cloneApi.sumTokens({ tokensAndOwners })
  const bals = await api.multiCall({ abi: 'uint256:totalBalance', calls: tokensAndOwners.map(i => i[1]) })
  const tokens = tokensAndOwners.map(i => i[0])
  api.add(tokens, bals)
  api.getBalancesV2().subtract(cloneApi.getBalances())
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners }),
    borrowed,
  },
}
