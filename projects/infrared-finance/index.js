const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

// Infrared Finance contract addresses
const CONFIG = {
  berachain: {
    iBERA: "0x9b6761bf2397Bb5a6624a856cC84A3A14Dcd3fe5", 
  }
}

const abi = {
  deposits: "function deposits() view returns (uint256)",
  totalSupply: "function totalSupply() view returns (uint256)",
  pending: "function pending() view returns (uint256)",
}

async function tvl(api) {
  const chain = api.chain
  const iBERA = CONFIG[chain].iBERA

  // Get total deposits in the protocol
  const totalDeposits = await api.call({
    target: iBERA,
    abi: abi.deposits,
  })

  // Get pending deposits that haven't been staked yet
  const pendingDeposits = await api.call({
    target: iBERA,
    abi: abi.pending,
  })

  // Calculate actual TVL by subtracting pending deposits from total deposits
  const stakedBera = totalDeposits - pendingDeposits

  // Add BERA balance to TVL
  // Using null address for native token (BERA)
  api.add(ADDRESSES.null, stakedBera)

  return api.getBalances()
}

module.exports = {
  methodology: "Counts the total amount of BERA tokens staked through the Infrared Finance protocol. TVL includes only actively staked BERA and excludes pending deposits that haven't been staked yet.",
  berachain: {
    tvl
  },
}

