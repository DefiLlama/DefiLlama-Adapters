const { getCuratorExport } = require("../helper/curators");

const customConfig = {
  ethereum: {
    getUnderlyings: [
      '0xb11ed12e302815c8c5f12a3a1a93ebd7bd730a21', // curve
      '0x8a827aab3f1a2a1efa20279666849e6fe155fb1f', // aave
      '0xE29DEe8c6805314B9aBC4dBF07b7B314Ea0F2e77', // aave
      '0x0b5d15445b715bf117ba0482b7a9f772af46d93a', // eigenLayer
      '0x5bb8e5e8602b71b182e0efe256896a931489a135', // symbiotic
    ],
    aaveLeverage: [
      '0xba7fdD2630F82458b4369A5B84D6438352BA4531',
      '0x1d3fa8bd88f246c6c6e5582690f9198fae16b195',
      '0x5Be0b2228cd022fB7CE4061c7628E2714ba9FA0D',
      '0x0221B322AD36Bbdf872a15c6010301B261aC097A',
      '0xB3E262Ef1479ed8c66578bAeBF6356A08ceE0904',
      '0x86761bE7D4e6Fe6f35B3335765A20B2b2e1849a3',
      '0x2AFBd96Fb854083574B738b36Af34703C89B8656',
      '0xA43c0C89321b10bF0DbDb0A8fc735c88b9B65792',
    ],
    holding: [
      ['0x8292bb45bf1ee4d140127049757c2e0ff06317ed', '0xA40aFb15275A94F64aF37C0cEaAaA45Cb568A361'],
      ['0x8292bb45bf1ee4d140127049757c2e0ff06317ed', '0xfBCA329E2Ee0c44d8F115A4B8F7ceda9E109f436'],
      ['0x8236a87084f8b84306f72007f36f2618a5634494', '0x9B6a57Fda106eff13ffE4ea4Ef2783C547f75cd7'],
      ['0xe72b141df173b999ae7c1adcbf60cc9833ce56a8', '0x778aC5d0EE062502fADaa2d300a51dE0869f7995'],
      ['0x6c3ea9036406852006290770bedfcaba0e23a0e8', '0x2A601FC6C0Cb854fDA82715E49Ab04C5340A0396'],
      ['0x6c3ea9036406852006290770bedfcaba0e23a0e8', '0x11Fd9E49c41738b7500748f7B94B4DBb0E8c13d2'],
    ],
  }
}

const abis = {
  getUnderlyings: 'function getUnderlyings() view returns (address[] assets, uint256[] amounts)',
  loanConfig: 'function loanConfig() view returns (address supplyAddress, address borrowAddress, uint256 minHealthFactor)',
  getSupply: 'uint256:getSupply',
  getBorrow: 'uint256:getBorrow',
}

const curatorExport = getCuratorExport({
  methodology: 'Count all assets are deposited in all vaults curated by Sentora.',
  blockchains: {
    ethereum: {
      eulerVaultOwners: [
        '0x5aB5FE7d04CFDeFb9daf61f6f569a58A53D05eE1',
        '0xe78C246ea973389F55BAEADF71e04750D50417d1',
      ],
      morphoVaultOwners: [
        '0x13DE0cEE0B83562CBfD46682e10FfA4E3c5090e1',
        '0x113191222789173F32B4084EF8d31b5A8aE945bB',
      ],
    },
    solana: {
      kaminoLendVaultAdmins: ['7fLxEftpppneavpueYgP2s7HhSGbWpj2jTCmAEwwqonY'],
      kaminoLendVaults: ['A2wsxhA7pF4B2UKVfXocb6TAAP9ipfPJam6oMKgDE5BK'],
    },
  }
})

const handlers = {
  async getUnderlyings(api, vaults) {
    const results = await api.multiCall({ calls: vaults, abi: abis.getUnderlyings })
    results.forEach(({ assets, amounts }) => api.add(assets, amounts))
  },
  async aaveLeverage(api, vaults) {
    const configs = await api.multiCall({ calls: vaults, abi: abis.loanConfig })
    const supplies = await api.multiCall({ calls: vaults, abi: abis.getSupply })
    const borrows = await api.multiCall({ calls: vaults, abi: abis.getBorrow })
    configs.forEach(({ supplyAddress, borrowAddress }, i) => {
      api.add(supplyAddress, supplies[i])
      api.add(borrowAddress, -borrows[i])
    })
  },
  async holding(api, tokensAndOwners) {
    return api.sumTokens({ tokensAndOwners })
  },
}

async function customTvl(api) {
  const cfg = customConfig[api.chain]
  if (!cfg) return api.getBalances()
  for (const [key, data] of Object.entries(cfg)) {
    if (handlers[key]) await handlers[key](api, data)
    else console.log(`[${api.chain}] No handler for "${key}", skipping`)
  }
  return api.getBalances()
}

module.exports = {
  ...curatorExport,
  ethereum: {
    ...curatorExport.ethereum,
    tvl: async (api) => {
      await curatorExport.ethereum.tvl(api)
      await customTvl(api)
    },
  },
}
