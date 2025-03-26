const BASE_CONTRACT = '0x813303b6F253C74D997020518227f87Ff721F53F';
const ABI_FARMZ = "function farmzLatestStats() view returns (uint256 totalInvested, uint256 currentTVL, uint256 insurance, uint256 totalPaidOut)"
// 0xdbe214c863d6b2ecf5d79012e5d03aab09c57e28
const ADDRESSES = require('../helper/coreAssets.json')

async function getInvestedValue(api, contractAddress, abi) {
  const response = await api.call({ target: contractAddress, abi, });

  return api.add(ADDRESSES.base.USDC, response.totalInvested)
}

async function tvl(api) {
  await getInvestedValue(api, BASE_CONTRACT, ABI_FARMZ);
}

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl,
  },
};