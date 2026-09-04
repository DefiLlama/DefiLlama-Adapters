const { getCuratorExport } = require("../helper/curators");
const { sumERC4626Vaults } = require("../helper/erc4626");
const { PublicKey } = require("@solana/web3.js");
const { Program } = require("@project-serum/anchor");
const { getConnection } = require("../helper/solana");

const KAMINO_LEND_PROGRAM_ID = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
const KAMINO_VAULT_PROGRAM_ID = new PublicKey('KvauGMspG5k6rtzrqqn7WNn3oZdyKqLKwK2XWQ8FLjd');

const KAMINO_VAULTS = [
  'DWSXb18xZApz29vnQpgR2m6MynCT7PznaXt7Ut7M7KaP', // RWA USDC
  '2TNCzzYJt3uHmpFpqeeJkza4pQUK9xoLa79DJH9AdgGA', // Marinade USD
  'HoffqVZUNGGpEAhE42E1DqNYSwJjCkorfgiBN6NpT2or', // RockawayX SOL
];

// Reserves of the Kamino markets curated by RockawayX
const KAMINO_RESERVES = [
  // Obligate market
  '6nk5K3PiV3EHtW4LLFhfMc1uR4kNwEfibvTdWqxCm6WF',
  'Au2Cg9CNNTX1KfzVhNnpi1ouHX74CwMMBvmSchmqS5ZW',
  // Huma market
  '4QKFoFDzNFnvfkzVazABbCEfMwd3y1pZqUVzmpnkCphj',
  '9XbExNmevn7jzNzbX3kAzxKq83mdYP5ZN4xcYpLUVHGU',
  'DzgYbR8HFQKf8YLCJ6M3E6ricB1xWAiNGZ2TB7X2KDHz',
  // Raiku market
  'J7idSfhvLqdkSmbMvhHMXBAhZMJVxEtzqXo45JB9HZrP',
  '7272BNf9uoivyX5h8B7799yoxSfF4WDuzcP7HDwSPLqN', // PT-rkuSOL, no price feed: counted as zero
  'EMyn5A2HhvYhojiibR3znk5QyafRVnK4oZ725XYzzf2s',
];

const EMBER_VAULTS = {
  ethereum: [
    '0x953972ea0C1703c58F09FB6fD2477Fdcf0FEe074', // eY10K
  ],
};

const LISTA_VAULTS = {
  bsc: [
    '0xb5a30e1fa2cf3c8dea882124b3ab5a47a27c5dd2',
  ],
};

const ACCOUNTABLE_VAULTS = {
  ethereum: [
    '0x0F0a9d3F0bc6006143c96E6995572b51413CB3c4', // Accountable USDC yield strategy
  ],
};

const configs = {
  methodology: 'Count all assets deposited in all vaults curated by RockawayX, plus the liquidity available in the reserves of the Kamino lending markets curated by RockawayX, net of the share of those reserves supplied by RockawayX kVaults.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x5f829B1B473cBA86838E1B7BB7E144DbDE228e21',
        '0xE0181090c22579B6A217f1522cbf8c9f1F0C1965',
        '0x64C18DCC4Ccb3b8D27877a4aeBB4C3126CB39cB9',
        '0xd65d6E8dbC3Cd3D12418199E6f4014dB3aaa0097',
        '0xe99A27169c2aA26a8f2757949d09Fa3f9A8f0B3B',
        '0x8aC91877b93330f52b2979a31a4879506021475c',
        '0x3BD9AdAE6643dDcddD02746b8B60075E56DF9478',
        '0x2cA22cb25558fa2018ecb1CE4eD8AF92Ee7ea423',
        '0x93e0F9d502eEfce8D34924ab3478C7EA0CBC5a2E',
        '0x9C57E02bC31e7e463f439353D97bd8f42F5a7F9c',
        '0xD6d4b804014EF27836dBe9f8f6Bf6c71251548Ec'
      ],
      upshiftV2: [
        '0xc87DBBB8C67e4F19fCD2E297c05937567b2572Ce', // Upshift Earn ctUSD
        '0xcd69123b3FBBfC666E1f6a501da27B564C00De54', // Upshift Tori
      ],
      midasTokens: [
        '0x030b69280892c888670EDCDCD8B69Fd8026A0BF3', // mMEV
        '0xb64C014307622eB15046C66fF71D04258F5963DC', // mevBTC
        '0x67E1F506B148d0Fc95a4E3fFb49068ceB6855c05'  // mROX
      ],
      erc4626: [
        '0x6f576e5192a14f259f7fe7347ecf63b255d7f7d1', // Term Finance - RockawayX Tori USDC (tsvRockXToriUSDC)
      ],
    },
    base: {
      morpho: [
        '0xAE4181CFB5aaA08bbE77d269c6B595672b9F9Edc',
      ],
    },
    sei: {
      morpho: [
        '0x6137dcfdd3c83fe2922b1cba4105d2e92b327a06', // PYUSD0
      ],
    },
    pharos: {
      morpho: [
        '0x047cd0a91e9b92ed979189a6c8a120bf280f02e5', // RockawayX USDC (roxUSDC)
      ],
    },
    solana: {
      kaminoLendVaults: KAMINO_VAULTS,
    },
    plume_mainnet: {
      midasTokens: [
        '0x7d611dC23267F508DE90724731Dc88CA28Ef7473', // mMEV
      ]
    },
    etlk: {
      midasTokens: [
        '0x5542F82389b76C23f5848268893234d8A63fd5c8', // mMEV
      ]
    }
  }
}

const adapterExport = getCuratorExport(configs);

for (const [chain, vaults] of Object.entries(EMBER_VAULTS)) {
  const baseTvl = adapterExport[chain]?.tvl;
  adapterExport[chain] = {
    tvl: async (api) => {
      if (baseTvl) await baseTvl(api);
      await sumERC4626Vaults({ api, calls: vaults, isOG4626: true });
    }
  };
}

for (const [chain, vaults] of Object.entries(LISTA_VAULTS)) {
  const baseTvl = adapterExport[chain]?.tvl;
  adapterExport[chain] = {
    tvl: async (api) => {
      if (baseTvl) await baseTvl(api);
      await sumERC4626Vaults({ api, calls: vaults, isOG4626: true });
    }
  };
}

async function accountableTvl(api, strategies) {
  // Accountable yield strategies report their NAV (deployed + idle assets) via lastTotalAssets
  const assets = await api.multiCall({ abi: 'address:asset', calls: strategies, permitFailure: true });
  const totalAssets = await api.multiCall({ abi: 'uint256:lastTotalAssets', calls: strategies, permitFailure: true });
  for (let i = 0; i < strategies.length; i++) {
    if (!assets[i] || totalAssets[i] === null || totalAssets[i] === undefined) continue;
    api.add(assets[i], totalAssets[i]);
  }
}

for (const [chain, vaults] of Object.entries(ACCOUNTABLE_VAULTS)) {
  const baseTvl = adapterExport[chain]?.tvl;
  adapterExport[chain] = {
    tvl: async (api) => {
      if (baseTvl) await baseTvl(api);
      await accountableTvl(api, vaults);
    }
  };
}

// Available liquidity of the reserves of the Kamino markets we curate. The share of a reserve
// supplied by our own kVaults is already counted through kaminoLendVaults, so it is netted out.
async function kaminoReserveTvl(api) {
  const connection = getConnection();
  const provider = { connection, publicKey: PublicKey.unique() };
  const lendProgram = new Program(require('../kamino-lending/kamino-lending-idl.json'), KAMINO_LEND_PROGRAM_ID, provider);
  const vaultProgram = new Program(require('../gauntlet/kvault-idl.json'), KAMINO_VAULT_PROGRAM_ID, provider);

  const vaultStates = await vaultProgram.account.vaultState.fetchMultiple(KAMINO_VAULTS.map(i => new PublicKey(i)));
  const ownCTokens = {};
  vaultStates.filter(i => i).forEach(state => {
    state.vaultAllocationStrategy.forEach(({ reserve, ctokenAllocation }) => {
      const key = reserve.toString();
      ownCTokens[key] = (ownCTokens[key] ?? 0n) + BigInt(ctokenAllocation.toString());
    });
  });

  const reserves = await lendProgram.account.reserve.fetchMultiple(KAMINO_RESERVES.map(i => new PublicKey(i)));
  reserves.forEach((reserve, i) => {
    if (!reserve) return;
    const available = BigInt(reserve.liquidity.availableAmount.toString());
    const cTokenSupply = BigInt(reserve.collateral.mintTotalSupply.toString());
    const own = ownCTokens[KAMINO_RESERVES[i]] ?? 0n;
    const externalShare = cTokenSupply > 0n ? available - (available * own) / cTokenSupply : available;
    if (externalShare > 0n) api.add(reserve.liquidity.mintPubkey.toString(), externalShare.toString());
  });
}

{
  const baseTvl = adapterExport.solana?.tvl;
  adapterExport.solana = {
    tvl: async (api) => {
      if (baseTvl) await baseTvl(api);
      await kaminoReserveTvl(api);
    }
  };
}

module.exports = adapterExport;
