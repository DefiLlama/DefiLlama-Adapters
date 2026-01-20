const { getUniTVL } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')

// TVL DEX Factories
const V2_FACTORY_CRONOS = '0xCd2E5cC83681d62BEb066Ad0a2ec94Bf301570C9';
const V2_FACTORY_ZKEVM = '0xEDc17bf0f27afc2e767cA08aE426d095207A7804';

// Staking contracts
const SMART_CHEF_FACTORY_CRONOS = "0x1eC6e891Bdaa523da0F538C9556064D909d0c566";
const SMART_CHEF_FACTORY_ZKEVM = "0x4E5CDf0A7a13f05e4168E3B2b9ba96c740877275";
const ROBIN_DIAMOND_CONTRACT = "0x6D5599616732Ea278235b47A76Cfd398fDe00DEB";
const FIXED_STAKING_CONTRACT = "0x1215B773d67fd9ed17656B08e223caEF4a93904f";

const liquidityPoolsCronos = getUniTVL({ factory: V2_FACTORY_CRONOS, useDefaultCoreAssets: true })
const liquidityPoolsZkEVM = getUniTVL({ factory: V2_FACTORY_ZKEVM, useDefaultCoreAssets: true })

async function stakingSmartChef(factoryAddress, api) {
  const [poolAddresses, stakedTokens] = await api.call({
    abi: "function getAllPoolTVL() view returns (address[] poolAddresses, address[] stakedTokens, uint256[] stakedAmounts)",
    target: factoryAddress,
  });

  return sumTokens2({ tokensAndOwners2: [stakedTokens, poolAddresses], api });
}

async function stakingPoolContract(api, contractAddress, poolAbi) {
  const poolLength = await api.call({ target: contractAddress, abi: "uint256:poolLength" });
  const tokens = await api.fetchList({ lengthAbi: "uint256:poolLength", itemAbi: poolAbi, target: contractAddress });
  return sumTokens2({
    api,
    owner: contractAddress, tokens: tokens.map(i => i.token),
  });
}

async function stakingRobinDiamond(api) {
  return stakingPoolContract(
    api,
    ROBIN_DIAMOND_CONTRACT,
    "function pools(uint256) view returns (address token, address rewardToken, uint256, uint256 totalDeposited, uint256, uint256, uint256, uint256, address, uint256)"
  );
}

async function stakingFixedStaking(api) {
  return stakingPoolContract(
    api,
    FIXED_STAKING_CONTRACT,
    "function pools(uint256) view returns (address token, uint32 endDay, uint32 lockDayPercent, uint32 unlockDayPercent, uint32 lockPeriod, uint32 withdrawalCut1, uint32 withdrawalCut2, bool depositEnabled, uint128 maxDeposit, uint128 minDeposit, uint128 totalDeposited, uint128 maxPoolAmount)"
  );
}

async function cronosStaking(api) {
  await Promise.all([
    stakingSmartChef(SMART_CHEF_FACTORY_CRONOS, api),
    stakingRobinDiamond(api),
    stakingFixedStaking(api),
  ]);
}

async function zkevmStaking(api) {
  return stakingSmartChef(SMART_CHEF_FACTORY_ZKEVM, api);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL includes all liquidity pools from Obsidian V2 factories across Cronos and Cronos zkEVM. Staking includes tokens staked in Fixed Staking, SmartChefFactory, and RobinDiamondHands contracts for yield farming and staking rewards.",
  cronos: {
    tvl: liquidityPoolsCronos,
    staking: cronosStaking,
  },
  cronos_zkevm: {
    tvl: liquidityPoolsZkEVM,
    staking: zkevmStaking,
  },
};