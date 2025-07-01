const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require('bignumber.js')

const FACTORY_ADDRESS = '0x356e1f9a61ba78f547829f3954af4517aaf4c943'

const factoryAbi = {
  "totalUsers": "function totalUsers() view returns (uint256)",
  "userAtIndex": "function userAtIndex(uint256) view returns (address)",
  "getAllActiveSystems": "function getAllActiveSystems(address user) view returns (tuple(address router, address state, address callback, address gmxAdapter, address reconciler, uint256 version, bool active, uint256 createdAt, uint256 updatedAt)[])",
  "config": "function config() view returns (address)"
}

const configAbi = {
  "reader": "function reader() view returns (address)",
  "datastore": "function datastore() view returns (address)", 
  "collateralToken": "function collateralToken() view returns (address)"
}

const stateAbi = {
  "getBot": "function getBot() view returns (tuple(address market, uint256 leverage, uint256[] gridLevels, uint256 upperPrice, uint256 lowerPrice, uint256 gridStartPrice, uint256 initialEntryPrice, uint256 initialMargin, uint256 investedMargin, uint256 totalProfit, bool isActive, bool autoCompound, bool isLong, uint256 collateralPerOrder, uint8 gridMode, uint256 createdAt, uint256 updatedAt))",
  "getSubmittedOrdersPaginated": "function getSubmittedOrdersPaginated(uint256 fromIndex, uint256 toIndex) view returns (tuple(uint256 internalOrderId, bytes32 gmxOrderKey, tuple(address market, uint256 sizeDeltaUsd, uint256 initialCollateralDeltaAmount, uint256 triggerPrice, uint256 acceptablePrice, uint256 executionFee, bool isLong, uint8 orderType, uint8 decreasePositionSwapType, bool shouldAutoCancel, bool shouldUnwrapNativeToken, address receiver, address callbackContract, address uiFeeReceiver, address cancellationReceiver) orderParams, uint8 gridBotOrderType, uint8 status, uint256 gridLevel, uint256 parentInternalOrderId, uint256 executedOutputAmount, uint256 profit, uint256 createdAt, uint256 updatedAt)[])"
}

const readerAbi = {
  "getAccountPositions": "function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) view returns (tuple(tuple(address account, address market, address collateralToken) addresses, tuple(uint256 sizeInUsd, uint256 sizeInTokens, uint256 collateralAmount, uint256 borrowingFactor, uint256 fundingFeeAmountPerSize, uint256 longTokenClaimableFundingAmountPerSize, uint256 shortTokenClaimableFundingAmountPerSize, uint256 increasedAtTime, uint256 decreasedAtTime) numbers, tuple(bool isLong) flags)[])"
}

const erc20Abi = {
  "balanceOf": "function balanceOf(address) view returns (uint256)",
  "decimals": "function decimals() view returns (uint8)"
}

async function getAllUsers(api) {
  const totalUsers = await api.call({ target: FACTORY_ADDRESS, abi: factoryAbi.totalUsers })
  
  if (totalUsers == 0) return []
  
  const userCalls = []
  for (let i = 0; i < totalUsers; i++) {
    userCalls.push({ target: FACTORY_ADDRESS, params: [i] })
  }
  
  const users = await api.multiCall({ abi: factoryAbi.userAtIndex, calls: userCalls })
  const validUsers = users.filter(addr => addr && addr !== ADDRESSES.null)
  
  return validUsers
}

async function getAllActiveSystems(api, userAddress) {
  try {
    const systems = await api.call({ 
      target: FACTORY_ADDRESS,
      abi: factoryAbi.getAllActiveSystems, 
      params: [userAddress] 
    })
    return systems
  } catch (error) {
    return []
  }
}

async function getSystemTVL(api, system, readerAddress, datastoreAddress, collateralTokenAddress, decimalsMultiplier, collateralDecimals) {
  try {
    // Get bot configuration first
    const botConfig = await api.call({ 
      target: system.state, 
      abi: stateAbi.getBot 
    }).catch((error) => {
      return null
    })

    if (!botConfig) {
      return 0
    }
    
    // Get position data from GMX reader
    const positions = await api.call({ 
      target: readerAddress, 
      abi: readerAbi.getAccountPositions, 
      params: [datastoreAddress, system.gmxAdapter, 0, 10] 
    }).catch((error) => {
      return []
    })
    
    // Get current position collateral 
    let currentPositionCollateral = 0
    if (positions && positions.length > 0) {
      currentPositionCollateral = Number(positions[0]?.numbers?.collateralAmount || 0)
    }

    // Get submitted orders using actual grid levels
    let marginUsedByOpenOrders = 0
    if (botConfig.gridLevels && botConfig.gridLevels.length > 0 && botConfig.leverage > 0) {
      try {
        const fromGridLevel = 0
        const toGridLevel = botConfig.gridLevels.length - 1
        
        const submittedOrders = await api.call({
          target: system.state,
          abi: stateAbi.getSubmittedOrdersPaginated,
          params: [fromGridLevel, toGridLevel]
        })

        if (submittedOrders && submittedOrders.length > 0) {
          // Sum margin used by open orders in 30 decimals, then scale to collateral token decimals (exactly like original)
          const marginUsedByOpenOrders30 = submittedOrders.reduce((sum, order) => {
            if (order.orderParams && order.orderParams.orderType === '3') { // LimitIncrease
              const sizeDeltaUsd = new BigNumber(order.orderParams.sizeDeltaUsd)
              const leverage = Number(botConfig.leverage) || 1
              
              // Calculate margin: sizeDeltaUsd / leverage (using BigNumber)
              const orderMargin = sizeDeltaUsd.div(leverage)
              return sum.plus(orderMargin)
            }
            return sum
          }, new BigNumber(0))
          
          // Scale from 30 decimals to collateral token decimals (divide by 10^24) exactly like original
          const scaledMarginUsedByOpenOrders = marginUsedByOpenOrders30.div(new BigNumber(10).pow(24))
          marginUsedByOpenOrders = Number(scaledMarginUsedByOpenOrders.toString()) / decimalsMultiplier
        }
      } catch (orderError) {
        // Silent error handling
      }
    }

    // Get free margin (collateral token balance of the router contract)
    const freeMargin = await api.call({ 
      target: collateralTokenAddress, 
      abi: erc20Abi.balanceOf, 
      params: [system.router] 
    }).catch((error) => {
      return 0
    })

    const freeMarginTokens = Number(freeMargin) / decimalsMultiplier

    // Calculate total TVL
    const positionCollateralTokens = currentPositionCollateral / decimalsMultiplier
    const totalTVL = positionCollateralTokens + marginUsedByOpenOrders + freeMarginTokens
    
    return totalTVL

  } catch (error) {
    return 0
  }
}

async function tvl(api) {
  if (api.chain !== 'arbitrum') return {}

  try {
    // Get all required addresses dynamically from factory and config
    const configAddress = await api.call({
      target: FACTORY_ADDRESS,
      abi: factoryAbi.config
    })

    const readerAddress = await api.call({
      target: configAddress,
      abi: configAbi.reader
    })
    const datastoreAddress = await api.call({
      target: configAddress,
      abi: configAbi.datastore
    })
    const collateralTokenAddress = await api.call({
      target: configAddress,
      abi: configAbi.collateralToken
    })

    // Get collateral token decimals
    const collateralDecimals = await api.call({
      target: collateralTokenAddress,
      abi: erc20Abi.decimals
    })
    
    const decimalsMultiplier = Math.pow(10, Number(collateralDecimals))

    const users = await getAllUsers(api)
    let totalTVL = 0
    
    // Process users in smaller batches to avoid RPC limits
    const batchSize = 5
    for (let i = 0; i < users.length; i += batchSize) {
      const userBatch = users.slice(i, i + batchSize)
      
      const batchPromises = userBatch.map(async (userAddress) => {
        try {
          const systems = await getAllActiveSystems(api, userAddress)
          let userTVL = 0
          
          for (const system of systems) {
            if (system.active) {
              const systemTVL = await getSystemTVL(api, system, readerAddress, datastoreAddress, collateralTokenAddress, decimalsMultiplier, collateralDecimals)
              userTVL += systemTVL
            }
          }
          
          return userTVL
        } catch (error) {
          return 0
        }
      })

      const batchResults = await Promise.all(batchPromises)
      const batchTotal = batchResults.reduce((sum, tvl) => sum + tvl, 0)
      totalTVL += batchTotal
    }

    // Add the total TVL as collateral token (convert back to raw token format)
    if (totalTVL > 0) {
      const tokenAmount = Math.floor(totalTVL * decimalsMultiplier)
      api.add(collateralTokenAddress, tokenAmount)
    }

    return api.getBalances()
    
  } catch (error) {
    return {}
  }
}

module.exports = {
  arbitrum: { tvl }
}
