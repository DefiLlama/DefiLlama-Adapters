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
  }
}

const exportObj = getCuratorExport(configs)

// Flare vault uses non-standard getTotalAssets() instead of totalAssets()
const FLARE_VAULT = '0x373D7d201C8134D4a2f7b5c63560da217e3dEA28' // Upshift FXRP
exportObj.flare = {
  tvl: async (api) => {
    const asset = await api.call({ abi: 'address:asset', target: FLARE_VAULT })
    const totalAssets = await api.call({ abi: 'uint256:getTotalAssets', target: FLARE_VAULT })
    api.add(asset, totalAssets)
  }
}

module.exports = exportObj