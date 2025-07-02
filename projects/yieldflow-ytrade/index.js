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

const readerAbi = {
  "getAccountPositions": "function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) view returns (tuple(tuple(address account, address market, address collateralToken) addresses, tuple(uint256 sizeInUsd, uint256 sizeInTokens, uint256 collateralAmount, uint256 borrowingFactor, uint256 fundingFeeAmountPerSize, uint256 longTokenClaimableFundingAmountPerSize, uint256 shortTokenClaimableFundingAmountPerSize, uint256 increasedAtTime, uint256 decreasedAtTime) numbers, tuple(bool isLong) flags)[])",
  "getAccountOrders": "function getAccountOrders(address dataStore, address account, uint256 start, uint256 end) view returns (tuple(tuple(address account, address receiver, address cancellationReceiver, address callbackContract, address uiFeeReceiver, address market, address initialCollateralToken, address[] swapPath) addresses, tuple(uint8 orderType, uint8 decreasePositionSwapType, uint256 sizeDeltaUsd, uint256 initialCollateralDeltaAmount, uint256 triggerPrice, uint256 acceptablePrice, uint256 executionFee, uint256 callbackGasLimit, uint256 minOutputAmount, uint256 updatedAtTime, uint256 validFromTime) numbers, tuple(bool isLong, bool shouldUnwrapNativeToken, bool isFrozen, bool autoCancel) flags)[])"
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

    // Get orders from GMX reader
    let marginUsedByOpenOrders = 0
  
      try {
        const orders = await api.call({
          target: readerAddress,
          abi: readerAbi.getAccountOrders,
          params: [datastoreAddress, system.gmxAdapter, 0, 999999999]
        })

        if (orders && orders.length > 0) {
          // Sum collateral used by open orders directly from initialCollateralDeltaAmount
          const totalOrderCollateral = orders.reduce((sum, order) => {
            if (order.numbers && order.numbers.orderType === '3') { // LimitIncrease (uint8 enum value)
              const collateralAmount = new BigNumber(order.numbers.initialCollateralDeltaAmount || 0)
              return sum.plus(collateralAmount)
            }
            return sum
          }, new BigNumber(0))
          
          // Convert from token decimals to human readable
          marginUsedByOpenOrders = Number(totalOrderCollateral.toString()) / decimalsMultiplier
        }
      } catch (orderError) {
        // Silent error handling
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
