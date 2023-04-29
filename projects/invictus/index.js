const ADDRESSES = require('../helper/coreAssets.json')
const { getTokenAccountBalance, getTokenBalance } = require('../helper/solana')

async function staking() {
  const stakedInv = await getTokenAccountBalance("5EZiwr4fE1rbxpzQUWQ6N9ppkEridNwbH3dU3xUf7wPZ")
  return {
    "invictus": stakedInv
  }
}

const treasury = "6qfyGvoUqGB6AQ7xLc4pVwFNdgJSbAMkTtKkBXhLRiV1"
async function tvl() {
  const [usdc,] = await Promise.all([
    ADDRESSES.solana.USDC, //usdc
  ].map(t => getTokenBalance(t, treasury)))
  return {
    "usd-coin": usdc,
  }

}


module.exports = {
  deadFrom: 1648765747,
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  solana: {
    tvl,
    staking
  }
}
