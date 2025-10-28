const vault = '0x936facdf10c8c36294e7b9d28345255539d81bc7' // RockSolid rock.rETH
const rETH = '0xae78736Cd615f374D3085123A210448E74Fc6393'

const totalAssetsABI = {
  "inputs": [],
  "name": "totalAssets",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}

// Works across all DefiLlama SDK versions
async function tvl(_, _b, _cb, { api }) {
  // Call totalAssets() method to get total rETH managed by the vault
  const totalAssets = await api.call({
    abi: totalAssetsABI,
    target: vault,
  })

  api.add(rETH, totalAssets)
}

module.exports = {
  methodology:
    'Calls totalAssets() on the RockSolid rock.rETH vault to get the total amount of rETH managed by the vault.',
  start: 1710000000, // replace with actual vault launch timestamp
  ethereum: { tvl },
  timetravel: true,
  misrepresentedTokens: false,
}
