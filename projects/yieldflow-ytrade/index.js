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
  "getAccountPositions": "function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) view returns (tuple(tuple(address account, address market, address collateralToken) addresses, tuple(uint256 sizeInUsd, uint256 sizeInTokens, uint256 collateralAmount, int256 pendingImpactAmount, uint256 borrowingFactor, uint256 fundingFeeAmountPerSize, uint256 longTokenClaimableFundingAmountPerSize, uint256 shortTokenClaimableFundingAmountPerSize, uint256 increasedAtTime, uint256 decreasedAtTime) numbers, tuple(bool isLong) flags)[])",
  "getAccountOrders": "function getAccountOrders(address dataStore, address account, uint256 start, uint256 end) view returns (tuple(bytes32 orderKey, tuple(tuple(address account, address receiver, address cancellationReceiver, address callbackContract, address uiFeeReceiver, address market, address initialCollateralToken, address[] swapPath) addresses, tuple(uint8 orderType, uint8 decreasePositionSwapType, uint256 sizeDeltaUsd, uint256 initialCollateralDeltaAmount, uint256 triggerPrice, uint256 acceptablePrice, uint256 executionFee, uint256 callbackGasLimit, uint256 minOutputAmount, uint256 updatedAtTime, uint256 validFromTime) numbers, tuple(bool isLong, bool shouldUnwrapNativeToken, bool isFrozen, bool autoCancel) flags) order)[])"
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

async function tvl(api) {
  if (api.chain !== 'arbitrum') return {}

  const configAddress = await api.call({
    target: FACTORY_ADDRESS,
    abi: factoryAbi.config
  })

  // Since config calls use different ABI methods, make individual calls
  const readerAddress = '0xe739e72E0e434A2626d6bE07590AcA74C00c764C';
  
  const datastoreAddress = await api.call({
    target: configAddress,
    abi: configAbi.datastore
  })
  const collateralTokenAddress = await api.call({
    target: configAddress,
    abi: configAbi.collateralToken
  })

  const collateralDecimals = await api.call({
    target: collateralTokenAddress,
    abi: erc20Abi.decimals
  })
  
  const decimalsMultiplier = Math.pow(10, Number(collateralDecimals))

  const users = await getAllUsers(api)
  if (users.length === 0) return api.getBalances()

  // Batch getAllActiveSystems calls for all users
  const systemCalls = users.map(userAddress => ({
    target: FACTORY_ADDRESS,
    params: [userAddress]
  }))
  const allUserSystems = await api.multiCall({ abi: factoryAbi.getAllActiveSystems, calls: systemCalls })

  // Collect all active systems across all users
  const allActiveSystems = []
  allUserSystems.forEach(systems => {
    if (systems && Array.isArray(systems)) {
      systems.forEach(system => {
        if (system.active) {
          allActiveSystems.push(system)
        }
      })
    }
  })

  if (allActiveSystems.length === 0) return api.getBalances()

  // Batch position calls for all active systems
  const positionCalls = allActiveSystems.map(system => ({
    target: readerAddress,
    params: [datastoreAddress, system.gmxAdapter, 0, 10]
  }))
  const allPositions = await api.multiCall({ abi: readerAbi.getAccountPositions, calls: positionCalls })

  // Batch order calls for all active systems
  const orderCalls = allActiveSystems.map(system => ({
    target: readerAddress,
    params: [datastoreAddress, system.gmxAdapter, 0, 999999999]
  }))
  const allOrders = await api.multiCall({ abi: readerAbi.getAccountOrders, calls: orderCalls })

  // Batch balance calls for all router contracts
  const balanceCalls = allActiveSystems.map(system => ({
    target: collateralTokenAddress,
    params: [system.router]
  }))
  const allBalances = await api.multiCall({ abi: erc20Abi.balanceOf, calls: balanceCalls })

  // Calculate total TVL from batched results
  let totalTVL = 0
  for (let i = 0; i < allActiveSystems.length; i++) {
    const positions = allPositions[i] || []
    const orders = allOrders[i] || []
    const freeMargin = allBalances[i] || 0

    // Get current position collateral
    let currentPositionCollateral = 0
    if (positions.length > 0) {
      currentPositionCollateral = Number(positions[0]?.numbers?.collateralAmount || 0)
    }

    // Calculate margin used by open orders
    let marginUsedByOpenOrders = 0
    if (orders.length > 0) {
      const totalOrderCollateral = orders.reduce((sum, orderInfo) => {
        const order = orderInfo.order
        if (order.numbers && order.numbers.orderType === '3') {
          const collateralAmount = new BigNumber(order.numbers.initialCollateralDeltaAmount || 0)
          return sum.plus(collateralAmount)
        }
        return sum
      }, new BigNumber(0))
      
      marginUsedByOpenOrders = Number(totalOrderCollateral.toString()) / decimalsMultiplier
    }

    const freeMarginTokens = Number(freeMargin) / decimalsMultiplier
    const positionCollateralTokens = currentPositionCollateral / decimalsMultiplier
    const systemTVL = positionCollateralTokens + marginUsedByOpenOrders + freeMarginTokens
    
    totalTVL += systemTVL
  }

  if (totalTVL > 0) {
    const tokenAmount = Math.floor(totalTVL * decimalsMultiplier)
    api.add(collateralTokenAddress, tokenAmount)
  }

  return api.getBalances()
}

module.exports = {
  arbitrum: { tvl }
}
