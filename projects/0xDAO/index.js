const oxLensAbi = {
  "oxPoolsAddresses": "address[]:oxPoolsAddresses",
  "oxPoolsData": "function oxPoolsData(address[] _oxPoolsAddresses) view returns (tuple(address id, address stakingAddress, uint256 stakedTotalSupply, uint256 totalSupply, tuple(address id, string symbol, bool stable, address token0Address, address token1Address, address gaugeAddress, address bribeAddress, address[] bribeTokensAddresses, address fees, uint256 totalSupply) poolData)[])"
}

const veAbi = {
  "locked": "function locked(uint256) view returns (int128 amount, uint256 end)"
}

const partnerRewardsPoolAddress = "0xDA006E87DB89e1C5213D4bfBa771e53c91D920aC";
const oxdV1RewardsPoolAddress = "0xDA000779663501df3C9Bc308E7cEc70cE6F04211";
const oxSolidRewardPoolAddress = "0xDA0067ec0925eBD6D583553139587522310Bec60";
const solidAddress = "0x888EF71766ca594DED1F0FA3AE64eD2941740A20";
const veAddress = "0xcBd8fEa77c2452255f59743f55A3Ea9d83b3c72b";
const oxSolidAddress = "0xDA0053F0bEfCbcaC208A3f867BB243716734D809";

const { standardPoolInfoAbi } = require('../helper/masterchef')
const { sumTokens2 } = require("../helper/unwrapLPs.js");

async function tvl(api) {
  const masterchef = "0xa7821c3e9fc1bf961e280510c471031120716c3d"
  const oxd = "0xc165d941481e68696f43ee6e99bfb2b23e0e3114"
  const tokens = (await api.fetchList({ lengthAbi: 'poolLength', itemAbi: standardPoolInfoAbi, target: masterchef })).map(i => i.lpToken)
  await api.sumTokens({ owner: masterchef, tokens, blacklistedTokens: [oxd] })

  // 0xDAO Core
  const oxLensAddress = "0xDA00137c79B30bfE06d04733349d98Cf06320e69";

  // Fetch pools addresses
  const oxPoolsAddresses = await api.call({ target: oxLensAddress, abi: oxLensAbi.oxPoolsAddresses })
  const pageSize = 200;
  let currentPage = 0;

  let addresses = []
  while (addresses) {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    addresses = oxPoolsAddresses.slice(start, end);
    if (addresses.length === 0) {
      break;
    }
    currentPage += 1;

    const poolsData = await api.call({ params: [addresses], target: oxLensAddress, abi: oxLensAbi.oxPoolsData })
    poolsData.forEach(pool => api.add(pool.poolData.id, pool.totalSupply))
  }

  // Add locked SOLID
  const { amount: lockedSolidAmount } = await api.call({ target: veAddress, params: 2, abi: veAbi.locked })
  api.add(solidAddress, lockedSolidAmount);

  // Add staking pools TVL
  const oxdV1RewardsPoolBalance = await api.call({ target: oxdV1RewardsPoolAddress, abi: 'erc20:totalSupply' })
  const oxSolidRewardsPoolBalance = await api.call({ target: oxSolidRewardPoolAddress, abi: 'erc20:totalSupply' })
  const partnerRewardsPoolBalance = await api.call({ target: partnerRewardsPoolAddress, abi: 'erc20:totalSupply' })

  api.add(oxSolidAddress, oxdV1RewardsPoolBalance);
  api.add(oxSolidAddress, partnerRewardsPoolBalance);
  api.add(oxSolidAddress, oxSolidRewardsPoolBalance);

  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  fantom: {
    tvl
  }
}
