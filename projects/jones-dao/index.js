const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");
const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const addresses = require("./addresses");

const jAssetToAsset = {
  "0x662d0f9ff837a51cf89a1fe7e0882a906dac08a3": ADDRESSES.arbitrum.WETH, // jETH
  "0x5375616bb6c52a90439ff96882a986d8fcdce421": addresses.tokens.gohm, // jgOHM,
  "0xf018865b26ffab9cd1735dcca549d95b0cb9ea19": addresses.tokens.dpx, // jDPX
  "0x1f6fa7a58701b3773b08a1a16d06b656b0eccb23": addresses.tokens.rdpx, // jrdpx
};

const tokensAndOwners = [
  [addresses.tokens.uvrt, addresses.glp.stableRewardTracker],
  [addresses.tokens.uvrt, addresses.glp.router],
  [addresses.tokens.glp, addresses.glp.leverageStrategy],
];

const abi = {
  locker: "function lockedBalances(address _user) view returns (uint256 total, uint256 unlockable, uint256 locked, (uint112 amount, uint32 unlockTime)[] lockData)",
  glpManager: "function getLPManagerContracts(uint256 _nonce) view returns (address lp,address viewer,address swapper,address receiver,address priceHelper,address lpManager,address doubleTracker,address singleTrackerZero,address singleTrackerOne,address compounder,address router)"
}

async function tvl_arbitrum (api) {
  const [metavaultTokens, metavaultBalances, optionVaultTokens, optionVaultBalances, jusdcTvl] =
    await Promise.all([
      api.multiCall({ abi: "address:depositToken", calls: addresses.metaVaultsAddresses }),
      api.multiCall({ abi: "uint256:workingBalance", calls: addresses.metaVaultsAddresses }),
      api.multiCall({ abi: "address:asset", calls: addresses.optionVaultAddresses }),
      api.multiCall({ abi: "uint256:totalAssets", calls: addresses.optionVaultAddresses }),
      api.call({ abi: "uint256:totalAssets", target: addresses.jusdc.underlyingVault }),
    ]);

  api.addTokens(metavaultTokens, metavaultBalances);
  api.addTokens(optionVaultTokens, optionVaultBalances);
  api.addTokens(addresses.tokens.usdc, jusdcTvl);

  for (const factoryAddress of addresses.smartLpArbFactories) {
    const contracts = await api.fetchList({ lengthAbi: 'nonce', itemAbi: abi.glpManager, target: factoryAddress, startFromOne: true })
    const lpManagers = contracts.map(c => c.lpManager)

    const [token0s, token1s, aums] = await Promise.all([
      api.multiCall({ abi: "address:token0", calls: lpManagers, permitFailure: true }),
      api.multiCall({ abi: "address:token1", calls: lpManagers, permitFailure: true }),
      api.multiCall({ abi: "function aum() returns (uint256 amount0, uint256 amount1)", calls: lpManagers, permitFailure: true })
    ])

    lpManagers.forEach((_lp, i) => {
      const token0 = token0s[i]
      const token1 = token1s[i]
      const aum = aums[i]
      if (!token0 || !token1 || !aum) return
      api.add(token0, aum.amount0)
      api.add(token1, aum.amount1)
    })
  }

  return sumTokens2({ api, tokensAndOwners });
}

async function tvl_ethereum(api) {
  const [leftoverStrategy, total] = await Promise.all([
    api.call({ target: addresses.tokens.aura, params: [addresses.aura.strategy], abi: 'erc20:balanceOf' }),
    api.call({ target: addresses.aura.locker, params: [addresses.aura.strategy], abi: abi.locker }).then(res => res.total)
  ]);
  
  [leftoverStrategy, total].forEach((bals) => {
    api.add(addresses.tokens.aura, bals)
  });
}


module.exports = {
  arbitrum: {
    tvl: tvl_arbitrum,
    staking: stakings(addresses.stakingContracts, addresses.tokens.jones, "arbitrum"),
    pool2: pool2s(addresses.lpStaking, addresses.lps, "arbitrum", (addr) => {
      addr = addr.toLowerCase();
      return `arbitrum:${jAssetToAsset[addr] ?? addr}`;
    }),
  },

  ethereum: {
    tvl: tvl_ethereum,
  },
};
