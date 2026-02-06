/**
 * Flying Tulip yield wrapper contract addresses on Ethereum mainnet.
 * Each wrapper holds user deposits and generates yield through various strategies.
 * @type {string[]}
 */
const WRAPPERS = [
  '0x095d8B8D4503D590F647343F7cD880Fa2abbbf59', // USDC Wrapper
  '0x9d96bac8a4E9A5b51b5b262F316C4e648E44E305', // WETH Wrapper
  '0x267dF6b637DdCaa7763d94b64eBe09F01b07cB36', // USDT Wrapper
  '0xA143a9C486a1A4aaf54FAEFF7252CECe2d337573', // USDS Wrapper
  '0xE5270E0458f58b83dB3d90Aa6A616173c98C97b6', // USDTb Wrapper
  '0xe6880Fc961b1235c46552E391358A270281b5625', // USDe Wrapper
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:token', calls: WRAPPERS, })
  const capitals = await api.multiCall({ abi: 'uint256:capital', calls: WRAPPERS, })
  api.add(tokens, capitals)
}

module.exports = {
  methodology: 'TVL is calculated as the sum of capital deposited across all Flying Tulip yield wrappers. Each wrapper holds user deposits in strategies that generate yield.',
  ethereum: {
    tvl,
  },
}
