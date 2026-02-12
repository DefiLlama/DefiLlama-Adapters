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
  '0x038F5e5c4aD747036025ffBae1525926BB0bad68', // SCB
  '0xEEe452E8f7bf72f2f42c3Ed54aCCa04B56dcC2a2', // Lemniscap
  '0xC775262245118c7870A3948a7E5dde89BB25AD2D', // Lemniscap 2
  '0x918E1bb8030Dc51e34814Bcc6A582b8530F1a57D', // Tioga Capital
  '0xA8b2D8De0ef4502Ca5E4A2F85abD27fcef28c631', // Hypersphere
  '0x54b56383d79F80e0466EB1e8cCdaa9C189e79032', // Sigil Fund
  '0x7c576Cb3ff9f28dCE25F181734D1e867304524C1', // Amber Group
  '0xDf6C06f9c7E3807905B387dF22BA0397b24381e4', // Paper Ventures
  '0xFB3342C91e8B74975AaA6BD2b740f797FEF9D81c', // Fasanara
  '0xa20E72317402f37940Aa8456453c2D1c4095e89c', // Atlas
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
