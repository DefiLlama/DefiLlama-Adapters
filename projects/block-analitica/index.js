const { getCuratorExport } = require("../helper/curators")
const { mergeExports } = require("../helper/utils")

const morphoConfigs = {
  methodology: 'Count all assets deposited in all vaults curated by Block Analitica.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x38989BBA00BDF8181F4082995b3DEAe96163aC5D',
        '0x2C25f6C25770fFEC5959D34B94Bf898865e5D6b1',
        '0x186514400e52270cef3D80e1c6F8d10A75d47344',
      ],
    },
    base: {
      morpho: [
        '0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1',
        '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca',
        '0x543257eF2161176D7C8cD90BA65C2d4CaEF5a796',
        '0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026',
      ],
    },
  },
}

const summerConfig = {
  ethereum: '0x09eb323dBFECB43fd746c607A9321dACdfB0140F',
  base: '0x09eb323dBFECB43fd746c607A9321dACdfB0140F',
  arbitrum: '0x09eb323dBFECB43fd746c607A9321dACdfB0140F',
  sonic: '0xa8E4716a1e8Db9dD79f1812AF30e073d3f4Cf191',
}

const curatorExports = getCuratorExport(morphoConfigs)

async function tvlSummer(api) {
  const factory = summerConfig[api.chain]
  const vaults = await api.call({ abi: 'address[]:getActiveFleetCommanders', target: factory })
  return api.erc4626Sum({ calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets'})
}

const CHAINS = ['ethereum', 'arbitrum', 'base', 'sonic']

for (const chain of CHAINS) {
  const originalTvl = curatorExports[chain]?.tvl;

  curatorExports[chain] = {
    ...(curatorExports[chain] || {}),
    tvl: async (api) => {
      if (originalTvl) await originalTvl(api);
      await tvlSummer(api);
    },
  };
}

module.exports = mergeExports({
  ...curatorExports,
  doublecounted: true,
  methodology: morphoConfigs.methodology,
})
