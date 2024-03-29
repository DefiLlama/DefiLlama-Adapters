const ADDRESSES = require('../helper/coreAssets.json')
const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2, } = require('../helper/unwrapLPs')

const COMPOUND_ORACLE_NAME = 'CompoundV3PositionOracle'
const AAVE_ORACLE_NAME = 'AaveV3PositionOracle'

const config = {
  polygon: {
    graphUrl: 'https://api.thegraph.com/subgraphs/name/fico23/aera-subgraph-polygon',
    aavePool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    aavePoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    comets: [
      {
        address: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
        baseToken: ADDRESSES.polygon.USDC
      }
    ],
    cometReward: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581'
  },
  ethereum: {
    graphUrl: 'https://api.thegraph.com/subgraphs/name/fico23/aera-subgraph',
    aavePool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    aavePoolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    comets: [
      {
        address: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
        baseToken: ADDRESSES.ethereum.WETH
      },
      {
        address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
        baseToken: ADDRESSES.ethereum.USDC
      }
    ],
    cometReward: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40'
  }
}

const graphQuery = `query MyQuery($block: Int) {vaultCreateds(block: {number: $block}){ id vault assetRegistry }}`

module.exports.methodology = 'Counts tokens held directly in vaults, as well as aave and compound positions.'
module.exports.start = 1682619377

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const GRAPH_URL = config[chain].graphUrl
      const AAVE_POOL = config[chain].aavePool
      const AAVE_POOL_DATA_PROVIDER = config[chain].aavePoolDataProvider
      const COMETS = config[chain].comets
      const COMET_REWARD = config[chain].cometReward
      const cacheKey = `aera/${chain}`

      const block = (await api.getBlock()) - 100 // polygon subgraph sync lags

      const { vaultCreateds } = await cachedGraphQuery(cacheKey, GRAPH_URL, graphQuery, { api, variables: { block } })

      const vaults = []
      const assetRegistries = []
      vaultCreateds.forEach(x => {
        vaults.push(x.vault)
        assetRegistries.push(x.assetRegistry)
      })

      const assets = await api.multiCall({ abi: abi.assets, calls: assetRegistries })

      const erc4626sAndOwners = []
      const tokensAndOwners = []

      const erc4626UnderylingMap = {}
      const positions = []

      for (let i = 0; i < vaults.length; ++i) {
        const vault = vaults[i]
        for (let j = 0; j < assets[i].length; ++j) {
          const assetInfo = assets[i][j]

          // position assets
          if (assetInfo.asset === assetInfo.oracle) {
            positions.push([assetInfo.asset, vault])
            continue
          }

          if (assetInfo.isERC4626) {
            if (!erc4626UnderylingMap[assetInfo.asset]) erc4626UnderylingMap[assetInfo.asset] = null
            erc4626sAndOwners.push([assetInfo.asset, vault])
          } else {
            tokensAndOwners.push([assetInfo.asset, vault])
          }
        }
      }

      const [underlyingTokens, vaultErc4626Balances, tokenNames,] = await Promise.all([
        api.multiCall({ abi: 'address:asset', calls: Object.keys(erc4626UnderylingMap) }),
        api.multiCall({ abi: 'erc20:balanceOf', calls: erc4626sAndOwners.map(x => ({ target: x[0], params: x[1] })) }),
        api.multiCall({ abi: 'string:name', calls: positions.map(x => x[0]), permitFailure: true }),
      ])
      await processLendingTvls(positions, tokenNames, api, AAVE_POOL, AAVE_POOL_DATA_PROVIDER, COMETS, vaults, COMET_REWARD)

      Object.keys(erc4626UnderylingMap).forEach((erc4626Asset, i) => erc4626UnderylingMap[erc4626Asset] = underlyingTokens[i])

      const vaultConvertToAssets = await api.multiCall({ abi: abi.convertToAssets, calls: erc4626sAndOwners.map((x, i) => ({ target: x[0], params: vaultErc4626Balances[i] })) })

      erc4626sAndOwners.forEach(([token,], i) => {
        const underlyingToken = erc4626UnderylingMap[token]
        api.add(underlyingToken, vaultConvertToAssets[i])
      })

      return sumTokens2({ api, tokensAndOwners })
    }
  }
})

async function processLendingTvls(positions, tokenNames, api, AAVE_POOL, AAVE_POOL_DATA_PROVIDER, COMETS, vaults, COMET_REWARD) {
  const compoundVaults = [];
  const aaveVaults = [];
  for (let i = 0; i < positions.length; ++i) {
    if (tokenNames[i] === COMPOUND_ORACLE_NAME) {
      compoundVaults.push(positions[i][1]);
    } else if (tokenNames[i] === AAVE_ORACLE_NAME) {
      aaveVaults.push(positions[i][1]);
    }
  }

  await Promise.all([
    processAaveTvl(aaveVaults, api, AAVE_POOL, AAVE_POOL_DATA_PROVIDER),
    processCompoundTvl(compoundVaults, api, COMETS, vaults, COMET_REWARD)
  ])
}

async function processCompoundTvl(compoundVaults, api, COMETS, vaults, COMET_REWARD) {
  if (compoundVaults.length) {
    const numAssets = await api.multiCall({ abi: 'uint8:numAssets', calls: COMETS.map(x => x.address) });


    const collateralCalls = [];
    COMETS.forEach((comet, i) => [...Array(parseInt(numAssets[i])).keys()].forEach(assetIndex => collateralCalls.push({ target: comet.address, params: assetIndex })));
    const balanceOfCalls = [];
    vaults.forEach(vault => COMETS.forEach(comet => balanceOfCalls.push({ target: comet.address, params: vault, baseToken: comet.baseToken })));
    const rewardOwedCalls = [];
    vaults.forEach(vault => COMETS.forEach(comet => rewardOwedCalls.push({ target: COMET_REWARD, params: [comet.address, vault] })));

    const [collateralInfos, balanceOfs, borrowBalanceOfs, rewardOwed] = await Promise.all([
      api.multiCall({ abi: abi.getAssetInfo, calls: collateralCalls }),
      api.multiCall({ abi: 'erc20:balanceOf', calls: balanceOfCalls }),
      api.multiCall({ abi: abi.borrowBalanceOf, calls: balanceOfCalls }),
      api.multiCall({ abi: abi.getRewardOwed, calls: rewardOwedCalls })
    ]);

    balanceOfs.forEach((balance, i) => {
      const sum = (BigInt(balance) - BigInt(borrowBalanceOfs[i])).toString();
      api.addToken(balanceOfCalls[i].baseToken, sum);
    });

    rewardOwed.forEach(reward => {
      api.addToken(reward.token, reward.owed);
    });

    const collateralBalanceOfCalls = [];
    vaults.forEach(vault => collateralInfos.forEach((collateral, i) => collateralBalanceOfCalls.push({ target: collateralCalls[i].target, params: [vault, collateral.asset] })));
    const collateralBalanceOfs = await api.multiCall({ abi: abi.collateralBalanceOf, calls: collateralBalanceOfCalls });

    collateralBalanceOfs.forEach((balance, i) => {
      api.addToken(collateralBalanceOfCalls[i].params[1], balance);
    });
  }
}

async function processAaveTvl(aaveVaults, api, AAVE_POOL, AAVE_POOL_DATA_PROVIDER) {
  if (aaveVaults.length) {
    const aaveReservesList = await api.call({ abi: abi.getReservesList, target: AAVE_POOL });

    const aaveReserveDetails = await api.multiCall({ abi: abi.getReserveData, target: AAVE_POOL, calls: aaveReservesList });

    const aaveQueryParams = [];
    aaveReservesList.forEach(asset => aaveVaults.forEach(vault => aaveQueryParams.push({ params: [asset, vault], })));
    const aavePositions = await api.multiCall({ abi: abi.getUserReserveData, target: AAVE_POOL_DATA_PROVIDER, calls: aaveQueryParams });

    for (const i in aavePositions) {
      const aavePosition = aavePositions[i];
      const reserveIdx = aaveReservesList.findIndex(x => x === aaveQueryParams[i].params[0]);

      api.addToken(aaveReserveDetails[reserveIdx].aTokenAddress, aavePosition.currentATokenBalance);
      api.addToken(aaveReserveDetails[reserveIdx].stableDebtTokenAddress, aavePosition.currentStableDebt);
      api.addToken(aaveReserveDetails[reserveIdx].variableDebtTokenAddress, aavePosition.currentVariableDebt);
    }
  }
}

const abi = {
  "collateralBalanceOf": "function collateralBalanceOf(address account, address asset) view returns (uint128)",
  "getReserveData": "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
  "assets": "function assets() view returns ((address asset, uint256 heartbeat, bool isERC4626, address oracle)[])",
  "convertToAssets": "function convertToAssets(uint256 shares) view returns (uint256 assets)",
  "getUserReserveData": "function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)",
  "getReservesList": "address[]:getReservesList",
  "getAssetInfo": "function getAssetInfo(uint8 i) view returns ((uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap))",
  "borrowBalanceOf": "function borrowBalanceOf(address account) view returns (uint256)",
  "getRewardOwed": "function getRewardOwed(address comet, address account) returns ((address token, uint256 owed))"
}