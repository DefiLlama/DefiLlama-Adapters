const { getUniqueAddresses } = require("../helper/tokenMapping");
const erc4626Abi = {
    'asset': 'function asset() external view returns (address)',
    'totalAssets': 'function totalAssets() public view returns (uint256)'
}

const stargateLpStakingAbi = {
    'userInfo': 'function userInfo( uint256 ,address  ) external view returns (uint256 amount, uint256 rewardDebt)',
}

const stargatePoolAbi = {
    'amountLPtoLD': 'function amountLPtoLD(uint256 _amountLP) external view returns (uint256)',
    'token': 'function token() external view returns (address)',
}
const ADDRESSES = require('../helper/coreAssets.json')

const contracts = {
    optimism: {
        vaults: [
            // usdc
            '0x034A4072E63aB05aF057e4E9aFC961EA584fB886', // entry
            '0xcf038417eac3bEa4be8f296B0Ed994e8410B6eBC', // polygon satellite
            '0x81C3b05753A40f7dd93F154eDC4112AF2F3B5B3b', // arbitrum satellite
            '0x5135Bd97b41871fC2745FEf24F941D9527B0b450',
            '0xD2FBB4Ee4b446766318A1766EA5bF38cAd4E3eEe',
            '0xA3c965A249855bff48925E4414A4b7f0920fbfe4',
        ],
    },
    polygon: {
        vaults: [
            '0xFABea2117d95b780077ca8dDf268BcC8c29589ED', // entry
            '0x98266478600d4Cae5082d2A185cc6533684dA108', // arbitrum satellite
            '0x4a307418cEd78A3f2348FD84e66453Efe0BDD16a', // optimisim satellite
            '0x3829d380bc9de2d1d421551f2D45FD81b3e82453',
            '0x9212728C3602A811927eFCa7a7628e88458D6525',
            '0x976d4B0368aB11b1c2677Dc7e71DA3640206a28d',
        ],
    },
    arbitrum: {
        vaults: [
            // usdc
            '0x98fCBbfb97B61e2DA167A69345c58e4126A5167B', // entry
            '0x801E78C94d5fffDD6F37684ad5ac68EF3b15E559', // polygon satellite
            '0x680924B3B81d918B01D43E80C092CF75C6063681', // optimisim satellite
            '0xe45011d955C17c00880300b20cF83Ca297aC8BC9',
            '0x691E1f8d698b6156EcdD0064B2e61d4a87aa041b',
            '0x867Ca248B3AB3dDF968304046b6346E3dD7aC5d2',
        ],
    },
}

const sgETHMapping = {
  ethereum: '0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c',
  arbitrum: '0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0',
  optimism: '0xb69c8CBCD90A39D8D3d3ccf0a3E968511C3856A0',
}

// convert stargate lp amount to underlying asset amount
const getStrategyVaultValues = async (api, vaultAddresses) => {
  // find the lpStaking contract address for each vault
  const lpStakingAddresses = await api.multiCall({ calls: vaultAddresses, abi: 'address:lpStaking', });
  // find the lpStaking poolId for each vault
  const lpStakingPoolIds = await api.multiCall({ calls: vaultAddresses, abi: 'uint256:lpStakingPoolId', });
  // find the lp staking pool of each vault
  const lpPools = await api.multiCall({ calls: vaultAddresses, abi: 'address:lp', });
  // find the lpAmount
  const lpAmounts = (await api.multiCall({
    calls: vaultAddresses.map((vaultAddress, i) => ({
      target: lpStakingAddresses[i],
      params: [lpStakingPoolIds[i], vaultAddress],
    })),
    abi: stargateLpStakingAbi.userInfo,
  })).map(([amount]) => amount);
  // find the amount of assets convert from lpAmount
  const convertedAmounts = await api.multiCall({
    calls: lpPools.map((lpPool, i) => ({
      target: lpPool,
      params: [lpAmounts[i]],
    })),
    abi: stargatePoolAbi.amountLPtoLD,
  });
  // find the underlying asset of each lp pool
  let assets = await api.multiCall({ calls: lpPools, abi: stargatePoolAbi.token, });
  // map stETH to ETH
  const stETH = sgETHMapping[api.chain]?.toLowerCase();
  assets = assets.map((asset) => {
    return asset.toLowerCase() === stETH ? ADDRESSES.null : asset;
  });

  return [assets, convertedAmounts];
}

// get the underlying asset of each base vault
const getVaultToken = async (api, addresses) => {
  return api.multiCall({ calls: addresses, abi: 'address:token', });
}

// get the underlying asset of each erc4626 vault
const get4626VaultToken = async (api, addresses) => {
  return api.multiCall({ calls: addresses, abi: erc4626Abi.asset, });
}

/** find balance of vault's underlying assets (excl. lp & positions)  */
const getUnderlyingTokenBalance = async (api, vaultAddresses) => {
  const vaultTokens = await getVaultToken(api, vaultAddresses);
  return api.sumTokens({ tokensAndOwners2: [vaultTokens, vaultAddresses] })
}

// find the strategy's vault's lp value
const getStrategyVaultsLpValue = async (api, vaultAddresses) => {
  const vaultTokens = await get4626VaultToken(api, vaultAddresses);
  await api.sumTokens({ tokensAndOwners2: [vaultTokens, vaultAddresses] })
  const [tokens, balances] = await getStrategyVaultValues(api, vaultAddresses);
  api.addTokens(tokens, balances);
}

const fetchStrategyAddresses = async (api, vaultAddresses) => {
  const addresses = await api.multiCall({
    calls: vaultAddresses,
    abi: 'address:strategy',
  });

  return getUniqueAddresses(addresses);
}

const filterAvailableVault = async (api, vaultAddresses) => {
  const available = await api.multiCall({
    calls: vaultAddresses,
    abi: 'address:token',
    permitFailure: true,
  });
  
  return vaultAddresses.filter((_, i) => available[i] != null)
}

const aggregateVaultTvl = async (api) => {
  const { vaults, } = contracts[api.chain];
  // check is available
  const availableVaults = await filterAvailableVault(api, vaults);
  const strategies = await fetchStrategyAddresses(api, availableVaults);
  await getUnderlyingTokenBalance(api, availableVaults);
  await getStrategyVaultsLpValue(api, strategies);
}

const tvl = async (api) => {
  await aggregateVaultTvl(api);
  return api.getBalances();
}

module.exports = {
  doublecounted: true,
  start: '2023-09-05', // Tue Sep 05 2023 16:00:00 GMT+0000
  methodology: 'Hodlify TVL including total values of assets deposited in other protocols, and the petty cash in our earning vaults.',
  arbitrum: { tvl },
  optimism: { tvl },
  polygon: { tvl },
}