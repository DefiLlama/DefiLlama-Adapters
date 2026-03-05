const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Clearstar.',
  blockchains: {
    base: {
      morphoVaultOwners: [
        '0x30988479C2E6a03E7fB65138b94762D41a733458',
      ],
      erc4626: [
        '0x1166250D1d6B5a1DBb73526257f6bb2Bbe235295', // yoUSD IPOR Fusion
        '0xfd843a3D9329C91CA22c5daA994BeA762541F954', // yoETH IPOR Fusion
      ],
    },
    ethereum: {
      morphoVaultOwners: [
        '0x30988479C2E6a03E7fB65138b94762D41a733458',
        '0x829A13850b684A575C0580a83322890e19c5eFaa',
      ],
      erc4626: [
        '0x18EE038C114a07f4B08b420fb1E4149a4F357249', // Upshift Wildcat USD
        '0xb2FdA773822E5a04c8A70348d66257DD5Cf442DB', // Upshift LiquityV2
        '0xdd5eff0756db08bad0ff16b66f88f506e7318894', // YieldFi yPrism
      ],
    },
    polygon: {
      morphoVaultOwners: [
        '0x30988479C2E6a03E7fB65138b94762D41a733458',
      ],
    },
    unichain: {
      morphoVaultOwners: [
        '0x30988479C2E6a03E7fB65138b94762D41a733458',
      ],
    },
    katana: {
      morphoVaultOwners: [
        '0x30988479C2E6a03E7fB65138b94762D41a733458',
      ],
    },
    arbitrum: {
      morphoVaultOwners: [
        '0x30988479C2E6a03E7fB65138b94762D41a733458',
      ],
    },
    hemi: {
      morphoVaultOwners: [
        '0x30988479C2E6a03E7fB65138b94762D41a733458'
      ],
    },
    hyperliquid: {
      eulerVaultOwners: [
        '0x6539519E69343535a2aF6583D9BAE3AD74c6A293' // HypurrFi / Euler HyperEVM vaults
      ],
    },
    starknet: {
      vesuV2: [
        '0x1bc5de51365ed7fbb11ebc81cef9fd66b70050ec10fd898f0c4698765bf5803' // Clearstar USDC Reactor
      ],
    },
    flare: {
      morpho: [
        '0xE8dd6A1e13244A27bDaa19CcBf33013647C675d1', // Core USDT0 Vault on Mystic
        '0x1aEadA3C251215f1294720B80FcB3D1D005F3585', // Core wFLR Vault on Mystic
        '0x53184aDaBF312b490BF1EbcFdC896FEfF6019a14', // Core FXRP Vault on Mystic
      ],
    },
  }
}

const exportObj = getCuratorExport(configs)
const existingFlareTvl = exportObj.flare?.tvl

// Flare vault uses non-standard getTotalAssets() instead of totalAssets()
const FLARE_VAULT = '0x373D7d201C8134D4a2f7b5c63560da217e3dEA28' // Upshift FXRP
exportObj.flare = {
  tvl: async (api) => {
    if (existingFlareTvl) await existingFlareTvl(api)
    const asset = await api.call({ abi: 'address:asset', target: FLARE_VAULT })
    const totalAssets = await api.call({ abi: 'uint256:getTotalAssets', target: FLARE_VAULT })
    api.add(asset, totalAssets)
  }
}

module.exports = {
  ...exportObj,

  timetravel: false, // starknet doesn't support historical queries
  hallmarks: [
    ['2026-02-10', "Start tracking Vesu V2 vaults on Starknet"],
  ],
}