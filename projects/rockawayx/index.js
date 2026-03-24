const { getCuratorExport } = require("../helper/curators");

const MIDAS_VAULTS = {
  ethereum: [
    '0x030b69280892c888670EDCDCD8B69Fd8026A0BF3', // mMEV
    '0xb64C014307622eB15046C66fF71D04258F5963DC', // mevBTC
  ],
  plume_mainnet: [
    '0x7d611dC23267F508DE90724731Dc88CA28Ef7473', // mMEV
  ],
  etlk: [
    '0x5542F82389b76C23f5848268893234d8A63fd5c8', // mMEV
  ],
};

const configs = {
  methodology: 'Count all assets deposited in all vaults curated by RockawayX.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x5f829B1B473cBA86838E1B7BB7E144DbDE228e21',
        '0xE0181090c22579B6A217f1522cbf8c9f1F0C1965',
        '0x64C18DCC4Ccb3b8D27877a4aeBB4C3126CB39cB9',
      ],
    },
    solana: {
      kaminoLendVaults: ['DWSXb18xZApz29vnQpgR2m6MynCT7PznaXt7Ut7M7KaP'], // Kamino RWA USDC
    },
  }
}

const adapterExport = getCuratorExport(configs);

async function midasTvl(api, vaults) {
  const totalSupplies = await api.multiCall({
    abi: 'uint256:totalSupply',
    calls: vaults,
    permitFailure: true
  });
  for (let i = 0; i < vaults.length; i++) {
    if (totalSupplies[i] === null || totalSupplies[i] === undefined) continue;
    api.add(vaults[i], totalSupplies[i]);
  }
}

for (const [chain, vaults] of Object.entries(MIDAS_VAULTS)) {
  const baseTvl = adapterExport[chain]?.tvl;
  adapterExport[chain] = {
    tvl: async (api) => {
      if (baseTvl) await baseTvl(api);
      await midasTvl(api, vaults);
    }
  };
}

module.exports = adapterExport;
