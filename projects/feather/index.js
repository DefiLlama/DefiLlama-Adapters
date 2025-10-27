const { getCuratorExport } = require("../helper/curators");
const axios = require('axios');

const configs = {
  methodology: 'Counts all assets that are deposited in all vaults curated by Feather.',
  blockchains: {
    sei: {
      morphoVaultOwners: [
        '0xf7F66970Cf68Cad32D321A37F6FF55Ad27d0b83D',
      ],
    },
  }
}

async function combinedSeiTvl(api) {
  // First, get the existing curator TVL
  const curatorExport = getCuratorExport(configs);
  if (curatorExport.sei && curatorExport.sei.tvl) {
    await curatorExport.sei.tvl(api);
  }
}

module.exports = {
  ...getCuratorExport(configs),
  sei: { tvl: combinedSeiTvl },
  timetravel: false,
  methodology: configs.methodology,
}
