const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2, } = require('../helper/unwrapLPs')
const {assetsABI, getReserveDataABI, getUserReserveDataABI, getReservesListABI, getAssetInfoABI, borrowBalanceOfABI, getRewardOwedABI, collateralBalanceOfABI, convertToAssetsABI} = require('./abi')

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
          baseToken: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
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
          baseToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
        },
        {
          address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
          baseToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        }
      ],
      cometReward: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40'
    }
}

const graphQuery = `query MyQuery($block: Int) {vaultCreateds(block: {number: $block}){ id vault assetRegistry }}`

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
      tvl: async (_, _b, _cb, { api, }) => {
        const GRAPH_URL = config[chain].graphUrl
        const AAVE_POOL = config[chain].aavePool
        const AAVE_POOL_DATA_PROVIDER = config[chain].aavePoolDataProvider
        const COMETS = config[chain].comets
        const COMET_REWARD = config[chain].cometReward
        const cacheKey = `aera-${chain}`

        block = (await api.getBlock()) - 100 // polygon subgraph sync lags

        const { vaultCreateds } = await cachedGraphQuery(cacheKey, GRAPH_URL, graphQuery, { api, variables: { block }})
        console.log('vaultCreateds', vaultCreateds)

        const vaults = []
        const assetRegistries = []
        vaultCreateds.forEach(x => {
          vaults.push(x.vault)
          assetRegistries.push(x.assetRegistry)
        })
        console.log('vaults', vaults.length)

        const assets = await api.multiCall({ abi: assetsABI, calls: assetRegistries.map(x => ({ target: x}))})
        const uniqueAssets = [...new Set(assets.flat().map(x => x.asset))]
        console.log('assets', assets.length)
        console.log('uniqueAssets', uniqueAssets.length)

        const erc4626sAndOwners = []
        const tokensAndOwners = []

        const erc4626UnderylingMap = {}
        const positions = []

        for (let i = 0; i < vaults.length; ++i) {
          const vault = vaults[i]
          for (let j = 0; j < assets[i].length; ++j) {
            const assetInfo = assets[i][j]

            // position assets
            if (assetInfo.asset === assetInfo.oracle){
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

        const [underlyingTokens, vaultErc4626Balances, tokenNames] = await Promise.all([
          api.multiCall({ abi: 'address:asset', calls: Object.keys(erc4626UnderylingMap)}),
          api.multiCall({abi: 'erc20:balanceOf', calls: erc4626sAndOwners.map(x => ({target: x[0], params: x[1]}))}),
          api.multiCall({abi: 'string:name', calls: positions.map(x => x[0]), permitFailure: true})
        ])

        Object.keys(erc4626UnderylingMap).forEach((erc4626Asset, i) => erc4626UnderylingMap[erc4626Asset] = underlyingTokens[i])

        const compoundVaults = []
        const aaveVaults = []
        for (let i = 0; i < positions.length; ++i) {
          console.log(tokenNames[i])
          if (tokenNames[i] === COMPOUND_ORACLE_NAME) {
            compoundVaults.push(positions[i][1])
          } else if (tokenNames[i] === AAVE_ORACLE_NAME) {
            aaveVaults.push(positions[i][1])
          }
        }


        if (aaveVaults.length) {
          const aaveReservesList = await api.call({abi: getReservesListABI, target: AAVE_POOL})

          const aaveReserveDetails = await api.multiCall({ abi: getReserveDataABI, calls: aaveReservesList.map(asset => ({target: AAVE_POOL, params: asset}))})

          const aaveQueryParams = []
          aaveReservesList.forEach(asset => aaveVaults.forEach(vault => aaveQueryParams.push({ target: AAVE_POOL_DATA_PROVIDER, params: [asset, vault], })))
          const aavePositions = await api.multiCall({ abi: getUserReserveDataABI, calls: aaveQueryParams})

          for (i in aavePositions) {
            const aavePosition = aavePositions[i]
            const reserveIdx = aaveReservesList.findIndex(x => x === aaveQueryParams[i].params[0])

            if (aavePosition.currentATokenBalance != '0') {
              console.log(1, aaveReserveDetails[reserveIdx].aTokenAddress, aavePosition.currentATokenBalance)
              api.addToken(aaveReserveDetails[reserveIdx].aTokenAddress, aavePosition.currentATokenBalance)
            }

            if (aavePosition.currentStableDebt != '0') {
              console.log(2, aaveReserveDetails[reserveIdx].stableDebtTokenAddress, aavePosition.currentStableDebt)
              api.addToken(aaveReserveDetails[reserveIdx].stableDebtTokenAddress, aavePosition.currentStableDebt)
            }

            if (aavePosition.currentVariableDebt != '0') {
              const reserveIdx = aaveReservesList.findIndex(x => x === aaveQueryParams[i].params[0])
              console.log(3, aaveReserveDetails[reserveIdx].variableDebtTokenAddress, aavePosition.currentVariableDebt)
              api.addToken(aaveReserveDetails[reserveIdx].variableDebtTokenAddress, aavePosition.currentVariableDebt)
            }
          }
        }

        if (compoundVaults.length) {
          const numAssets = await api.multiCall({abi: 'uint8:numAssets', calls: COMETS.map(x => x.address) })
          console.log('numassets', numAssets)


          const collateralCalls = []
          COMETS.forEach((comet, i) => [...Array(parseInt(numAssets[i])).keys()].forEach(assetIndex => collateralCalls.push({target: comet.address, params: assetIndex})))
          const balanceOfCalls = []
          vaults.forEach(vault => COMETS.forEach(comet => balanceOfCalls.push({target: comet.address, params: vault, baseToken: comet.baseToken})))
          const rewardOwedCalls = []
          vaults.forEach(vault => COMETS.forEach(comet => rewardOwedCalls.push({target: COMET_REWARD, params: [comet.address, vault]})))

          const [collateralInfos, balanceOfs, borrowBalanceOfs, rewardOwed] = await Promise.all([
            api.multiCall({abi: getAssetInfoABI, calls: collateralCalls}),
            api.multiCall({abi: 'erc20:balanceOf', calls: balanceOfCalls}),
            api.multiCall({abi: borrowBalanceOfABI, calls: balanceOfCalls}),
            api.multiCall({abi: getRewardOwedABI, calls: rewardOwedCalls})
          ])

          balanceOfs.forEach((balance, i) => {
            const sum = (BigInt(balance) - BigInt(borrowBalanceOfs[i])).toString()
            if (sum !== '0') api.addToken(balanceOfCalls[i].baseToken, sum) 
          })

          rewardOwed.forEach(reward => {
            if (reward.owed !== '0') api.addToken(reward.token, reward.owed)
          })

          const collateralBalanceOfCalls = []
          vaults.forEach(vault => collateralInfos.forEach((collateral, i) => collateralBalanceOfCalls.push({target: collateralCalls[i].target, params: [vault, collateral.asset]})))
          const collateralBalanceOfs = await api.multiCall({abi: collateralBalanceOfABI, calls: collateralBalanceOfCalls})

          collateralBalanceOfs.forEach((balance, i) => {
            if (balance !== '0') api.addToken(collateralBalanceOfCalls[i].params[1], balance)
          })
        }

        const vaultConvertToAssets = await api.multiCall({ abi: convertToAssetsABI, calls: erc4626sAndOwners.map((x, i) => ({target: x[0], params: vaultErc4626Balances[i]}))})

        const tokenBalancesMap = {}
        
        erc4626sAndOwners.forEach((token, i) => {
          if (tokenBalancesMap[token]) {
            tokenBalancesMap[token] += BigInt(vaultConvertToAssets[i])
          } else {
            tokenBalancesMap[token] = BigInt(vaultConvertToAssets[i])
          }
        })

        const tokens = []
        const balances = []
        Object.keys(tokenBalancesMap).forEach(token => {
          tokens.push(token)
          balances.push(tokenBalancesMap[token].toString())
        })

        api.addTokens(tokens, balances)
        
        return sumTokens2({ api, tokensAndOwners })
      }
    }
  })