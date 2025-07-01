const { sumTokens2 } = require('../helper/unwrapLPs')

const SMART_CHEF_FACTORY_CRONOS = "0x1eC6e891Bdaa523da0F538C9556064D909d0c566";
const SMART_CHEF_FACTORY_ZKEVM = "0x4E5CDf0A7a13f05e4168E3B2b9ba96c740877275";
const ROBIN_DIAMOND_CONTRACT = "0x6D5599616732Ea278235b47A76Cfd398fDe00DEB";

const legacyPools = [
  "0xEb741AA5E97D87cF7Ec78BBaCd59fD36DBaD926a",
  "0x5E601b58cdC06FA7ecE9d4aAD48f688cb3f245c0",
  "0x6dD01e7995eA304042253C7f12aAb99211fb5ceC",
  "0x1a3E5C6611C5F70Af9Ffa896f5276C219AeFb0cc",
  "0xeB525f34d1209f2c16359463Fce10CB37a6919e0",
  "0xC44762651c5Fe476Cc9Cee23bc32ae7771B3041c",
  "0xB6A1562270A13e4326Dc041561b059E9B2D7E8bF",
  "0x5d2FEe27F6AA1B2122e3B3ce2129d7a74b2F073c",
  "0xEe080D306a0f953474d69Bf687231dc5013bc8dB",
  "0x23F567e6690cc3a1E67182C5283F7fd29719EFD9",
  "0xf5c251D07c1150cdE903F025B0D06b003900a2E2",
  "0x37AFAcdEe65e782bC4115B630BCaADc81D3EceF9",
  "0xD481E45B91470FD85EBDaaab00E82D059f2c8dA5",
  "0x2b4E114828C304DE53bae92200c877a64aC41607",
];

async function tvlSmartChef(factoryAddress, api) {
  const [poolAddresses, stakedTokens] = await api.call({
    abi: "function getAllPoolTVL() view returns (address[] poolAddresses, address[] stakedTokens, uint256[] stakedAmounts)",
    target: factoryAddress,
  });

  const tokensAndOwners = stakedTokens.map((token, i) => [token, poolAddresses[i]]);
  return sumTokens2({ 
    api, 
    tokensAndOwners,
    resolveLP: true
  });
}

async function tvlRobinDiamond(api) {
  const poolLength = await api.call({ target: ROBIN_DIAMOND_CONTRACT, abi: "uint256:poolLength" });
  const tokensAndOwners = [];

  for (let i = 0; i < poolLength; i++) {
    const pool = await api.call({
      abi: "function pools(uint256) view returns (address token, address rewardToken, uint256, uint256 totalDeposited, uint256, uint256, uint256, uint256, address, uint256)",
      target: ROBIN_DIAMOND_CONTRACT,
      params: [i],
    });

    if (Number(pool.totalDeposited) > 0) {
      tokensAndOwners.push([pool.token, ROBIN_DIAMOND_CONTRACT]);
    }
  }

  return sumTokens2({ 
    api, 
    tokensAndOwners,
    resolveLP: true  
  });
}

async function tvlLegacyPools(api) {
  const tokens = await api.multiCall({
    abi: "function stakedToken() view returns (address)",
    calls: legacyPools.map((addr) => ({ target: addr })),
  });

  const tokensAndOwners = tokens.map((token, i) => [token, legacyPools[i]]);
  return sumTokens2({ 
    api, 
    tokensAndOwners,
    resolveLP: true  
  });
}

module.exports = {
  methodology: "TVL includes all tokens staked in Obsidian's SmartChefFactory and RobinDiamondHands contracts across Cronos and Cronos zkEVM. LP tokens are automatically unwrapped to show underlying token values. It reflects the total value locked in active staking and yield farming pools.",
  cronos: {
    tvl: async (api) => {
      const [chefTVL, robinTVL, legacyTVL] = await Promise.all([
        tvlSmartChef(SMART_CHEF_FACTORY_CRONOS, api),
        tvlRobinDiamond(api),
        tvlLegacyPools(api),
      ]);
      return {
        ...chefTVL,
        ...robinTVL,
        ...legacyTVL,
      };
    },
  },
  cronos_zkevm: {
    tvl: (api) => tvlSmartChef(SMART_CHEF_FACTORY_ZKEVM, api),
  },
};