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

// Treasury wallet holding stETH
const TREASURY = '0x1118e1c057211306a40A4d7006C040dbfE1370Cb'
const STETH = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'

// ftAaveYieldWrapper contract addresses on Ethereum mainnet
const AAVE_WRAPPERS = [
  '0x038f5E5c4aD747036025FfBaE1525926Bb0Bad68', // SCB
  '0xEeE452e8F7bF72F2F42c3Ed54ACcA04B56DcC2A2', // Lemniscap
  '0xc775262245118C7870A3948a7e5DDe89Bb25Ad2D', // Lemniscap 2
  '0x918E1BB8030DC51e34814BCc6A582b8530F1a57D', // Tioga Capital
  '0xA8b2D8De0eF4502cA5E4a2F85abD27fCEf28C631', // Hypersphere
  '0x54B56383D79f80e0466eB1E8CcDAa9c189E79032', // Sigil Fund
  '0x7c576CB3fF9F28dcE25F181734D1e867304524c1', // Amber Group
  '0xDf6C06f9c7E3807905B387dF22ba0397B24381e4', // Paper Ventures
  '0xFb3342c91E8b74975Aaa6bD2b740F797FeF9D81c', // Fasanara
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:token', calls: WRAPPERS, })
  const capitals = await api.multiCall({ abi: 'uint256:capital', calls: WRAPPERS, })
  api.add(tokens, capitals)

  const aaveTokens = await api.multiCall({ abi: 'address:underlying', calls: AAVE_WRAPPERS, })
  const aavePrincipals = await api.multiCall({ abi: 'uint256:principal', calls: AAVE_WRAPPERS, })
  api.add(aaveTokens, aavePrincipals)

  // stETH held in treasury
  const stethBalance = await api.call({ abi: 'erc20:balanceOf', target: STETH, params: [TREASURY], })
  api.add(STETH, stethBalance)
}

module.exports = {
  methodology: 'TVL is calculated as the sum of capital deposited across all Flying Tulip yield wrappers and ftAaveYieldWrapper contracts, plus stETH held in the Flying Tulip treasury.',
  ethereum: {
    tvl,
  },
}
