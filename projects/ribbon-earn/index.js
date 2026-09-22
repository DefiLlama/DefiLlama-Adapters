const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

// Ribbon Earn vaults
const rearnUSDC = "0x84c2b16FA6877a8fF4F3271db7ea837233DFd6f0";
const rearnstETH = "0xCE5513474E077F5336cf1B33c1347FDD8D48aE8c";

const tokensAndOwners = [
  [ADDRESSES.ethereum.USDC, rearnUSDC],
  [ADDRESSES.ethereum.STETH, rearnstETH],
]

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners }),
    borrowed: () => ({}),
  },
}
