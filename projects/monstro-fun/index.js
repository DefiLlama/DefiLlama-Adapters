const ADDRESSES = require('../helper/coreAssets.json')

const BASE_CONTRACT = '0x813303b6F253C74D997020518227f87Ff721F53F';
// 0xdbe214c863d6b2ecf5d79012e5d03aab09c57e28
const ABI_GOLEMZ = "function golemzLatestStats() view returns (uint256 totalInvested, uint256 currentTVL, uint256 insurance, uint256 totalPaidOut)";  // 0x07f2a4b640d0c780d52d476ac2b674d8a22bc1b1
const ABI_POOLZ = "function poolzLatestStats() view returns (uint256 totalInvested, uint256 currentTVL, uint256 insurance, uint256 totalPaidOut)"; // 0x4d0eb0e7e851787065f694b2e12e75bfa97be08e

async function getInvestedValue(api, contractAddress, abi) {
  const response = await api.call({ target: contractAddress, abi, });

  return api.add(ADDRESSES.base.USDC, response.totalInvested)
}

async function tvl(api) {
  await getInvestedValue(api, BASE_CONTRACT, ABI_GOLEMZ);
  await getInvestedValue(api, BASE_CONTRACT, ABI_POOLZ);
}

module.exports = {
  methodology: 'Sums the total invested value from farmz, golemz, and poolz contracts based on their respective latestStats functions.',
  hallmarks: [[1734804000, "BSC->Base ecosystem migration"]],
  misrepresentedTokens: true,
  base: {
    tvl,
  },
};