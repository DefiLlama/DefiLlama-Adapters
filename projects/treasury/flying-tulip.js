const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

// Treasury address (same across all chains)
const TREASURY = '0x1118e1c057211306a40A4d7006C040dbfE1370Cb'

// Flying Tulip yield wrapper contract addresses (Ethereum)
const WRAPPERS = [
  '0x095d8B8D4503D590F647343F7cD880Fa2abbbf59', // USDC Wrapper
  '0x9d96bac8a4E9A5b51b5b262F316C4e648E44E305', // WETH Wrapper
  '0x267dF6b637DdCaa7763d94b64eBe09F01b07cB36', // USDT Wrapper
  '0xA143a9C486a1A4aaf54FAEFF7252CECe2d337573', // USDS Wrapper
  '0xE5270E0458f58b83dB3d90Aa6A616173c98C97b6', // USDTb Wrapper
  '0xe6880Fc961b1235c46552E391358A270281b5625', // USDe Wrapper
]

// ftAaveYieldWrapper contract addresses (Ethereum)
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

// Underlying tokens for the wrappers (Ethereum)
const USDS = '0xdC035D45d973E3EC169d2276DDab16f1e407384F'
const USDTb = '0xC139190F447e929f090Edeb554D95AbB8b18aC1C'

// FT token address
const FT_TOKEN = '0x5DD1A7A369e8273371d2DBf9d83356057088082c'

async function wrapperCapital(api) {
  const tokens = await api.multiCall({ abi: 'address:token', calls: WRAPPERS })
  const capitals = await api.multiCall({ abi: 'uint256:capital', calls: WRAPPERS })
  api.add(tokens, capitals)

  const aaveTokens = await api.multiCall({ abi: 'address:underlying', calls: AAVE_WRAPPERS })
  const aavePrincipals = await api.multiCall({ abi: 'uint256:principal', calls: AAVE_WRAPPERS })
  api.add(aaveTokens, aavePrincipals)
  return api.getBalances()
}

const base = treasuryExports({
  ethereum: {
    owners: [TREASURY],
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDe,
      USDS,
      USDTb,
    ],
    ownTokens: [FT_TOKEN],
  },
  base: {
    owners: [TREASURY],
    tokens: [
      nullAddress,
      ADDRESSES.base.WETH,
      ADDRESSES.base.USDC,
      ADDRESSES.base.USDbC,
    ],
  },
  sonic: {
    owners: [TREASURY],
    tokens: [
      nullAddress,
      ADDRESSES.sonic.wS,
      ADDRESSES.sonic.USDC_e,
      ADDRESSES.sonic.WETH,
      ADDRESSES.sonic.scUSD,
    ],
  },
  avax: {
    owners: [TREASURY],
    tokens: [
      nullAddress,
      ADDRESSES.avax.WAVAX,
      ADDRESSES.avax.USDC,
      ADDRESSES.avax.USDt,
    ],
  },
  bsc: {
    owners: [TREASURY],
    tokens: [
      nullAddress,
      ADDRESSES.bsc.WBNB,
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
    ],
  },
})

// Combine treasury address balances with wrapper capital on Ethereum
base.ethereum.tvl = sdk.util.sumChainTvls([base.ethereum.tvl, wrapperCapital])

module.exports = base
