const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const {
  queryContract,
  sumTokens: sumTokensCosmos,
} = require("../helper/chain/cosmos");
const { sumTokens, } = require("../helper/unwrapLPs");
const vaultManagerAbi = "address[]:getVaults";
const vaultAbi = 'function self() view returns (tuple(address underwritingToken, uint32 start, uint32 expiration, uint8 underwritingTokenDecimals) config, tuple(tuple(tuple(uint128 numerator, uint128 denominator)[] expectedXVector, tuple(uint128 numerator, uint128 denominator)[] varCovarMatrix, tuple(uint128 numerator, uint128 denominator) lambda) config) amm, tuple(tuple(address standard, address rollover) underwritingPositionERC20, address nextVault, uint56 poolCount, uint32 latestInteraction, bool paused, uint256 premiums, uint256 premiumsAccruedPerShare, uint256 premiumDripBasis, uint256[] allocationVector) state)'

const networks = {
  ethereum: {
    // V2.5 Factory (underwriting tokens are dynamically fetched)
    vaultManager: "0x7B99AfA5A2EC23499e6CD6955dEdF85318347cc9",
    // V2 Vaults
    vaults: [
      // [underwritingAsset, vaultAddress]
      [
        ADDRESSES.ethereum.USDC,
        "0x83944C256e5C057A246aE1b1945934440eb35Af6",
      ],
      [
        ADDRESSES.ethereum.USDC,
        "0x8D999a2f262FfDA47A734B987D1A15bc984e45Be",
      ],
      [
        ADDRESSES.ethereum.USDC,
        "0x0881Ec8e0e743906E1c1dFeE8Ae12BfDc0611b24",
      ],
      [
        ADDRESSES.ethereum.USDC,
        "0x8529687adD661120C9E23E366Cc7F545f1A03ADf",
      ],
      [
        ADDRESSES.ethereum.USDC,
        "0x61635d1De721DD1DB35f8aCFD0f1ea367dF65671",
      ],
    ],
  },
  arbitrum: {
    vaultManager: "0x713C8810F79B4F101f66bB5b5a1326473ae5c7f7",
    vaults: [
      [
        ADDRESSES.arbitrum.USDC,
        "0x207472891AF32F5636c35d9ca8e17464Df7108bB",
      ],
      [
        ADDRESSES.arbitrum.USDC,
        "0xbcA81A2118982182d897845571BE950aE94C619c",
      ],
      [
        ADDRESSES.arbitrum.USDC,
        "0x2DafE4DD7C661c2CEaf967d51206f5130AA32782",
      ],
      [
        ADDRESSES.arbitrum.USDC,
        "0xdd74ee6c6568429537bf30cb63dab0061b83c41a"
      ],
      [
        ADDRESSES.arbitrum.USDC,
        "0xc7c52aa35d499e0c18ff3854f24e65d43c97d5a4"
      ],
      [
        ADDRESSES.arbitrum.USDC,
        "0x695d803207579bb4f34c97ab3e3a449de8ad042e"
      ],
      [
        ADDRESSES.arbitrum.USDC,
        "0x451709e54474a7a7df889e98124180847782cb4a"
      ]
    ],
  },
  avax: {
    vaultManager: "0xBf8c506a56F355d2340F37a91FA6569737b08254",
    vaults: [
      [
        ADDRESSES.avax.USDC,
        "0x2DafE4DD7C661c2CEaf967d51206f5130AA32782",
      ],
      [
        // Count av3CRV in the above vault too
        "0x1337BedC9D22ecbe766dF105c9623922A27963EC",
        "0x2DafE4DD7C661c2CEaf967d51206f5130AA32782",
      ],
      [
        ADDRESSES.avax.USDC,
        "0xBe09C11d28683E283fdf7566DE1685A6A221B6bf",
      ],
      [
        ADDRESSES.avax.USDC,
        "0xBe09C11d28683E283fdf7566DE1685A6A221B6bf",
      ],
    ],
  },
  fantom: {
    vaults: [
      [
        ADDRESSES.fantom.USDC,
        "0xca67B16b02E418CFbC9EF287C7C20B77dbb665f2",
      ],
    ],
  },
  aurora: {
    vaults: [
      [
        ADDRESSES.aurora.USDC_e,
        "0x8D999a2f262FfDA47A734B987D1A15bc984e45Be",
      ],
    ],
  },
  optimism: {
    vaultManager: "0x7c1187AF4D6B23F7f7682799454168E24bC06EED",
    vaults: [
      [
        ADDRESSES.optimism.USDC,
        "0xfB969b45Fa9186CD8B420407552aD447F7c3817b",
      ],
      [
        ADDRESSES.optimism.USDC,
        "0x88e7385eacf8e31c9cddce7632bfe654b58f4a09",
      ],
      [
        ADDRESSES.optimism.USDC,
        "0x88e7385eacf8e31c9cddce7632bfe654b58f4a09"
      ],
      [
        ADDRESSES.optimism.USDC,
        "0x01bd59477e03d9034684a118ba67cfa32cd9b123"
      ],
      [
        ADDRESSES.optimism.USDC,
        "0xdf9d37e1a19474e5928fb410a3f8513a25ba680c"
      ]

    ],
  },
  polygon: {
    vaults: [
      [
        ADDRESSES.polygon.USDC,
        "0xdf9d37e1a19474e5928fb410a3f8513a25ba680c"
      ],
      [
        ADDRESSES.polygon.USDC,
        "0xadaab38f3ecdf2b486eb3cab7f54bdcbdfb7fd66"
      ],
      [
        ADDRESSES.polygon.USDC,
        "0x4db26943e581c1befaa5d682f6404de17c028487"
      ],
      [
        ADDRESSES.polygon.USDC,
        "0xa644bdf7f0da0b83623ac4d01607ea91a24b1ede"
      ]
    ]
  },
  terra: {
    vaults: [
      "terra1dlfz2teqt5shxuw87npfecjtv7xlrxvqd4sapt", // Ozone v1 pool 1
      "terra1h6t8gx7jvc2ens9nrxcf9vqylzquey75e2wvzt", // Ozone v1 pool 2
    ],
  },
  terra2: {
    wrapped_luna: "terra1ufj34v4agxlazv6gv36fsdm5e8y4kclqgp0qt0l8ureql9pcwssspma238",
    factory: "terra1lnq5rk4gla2c537hpyxq6wjs8g0k0dedxug2p50myydaqjtm4g5ss94y8n",
    masterPool:
      "terra1gz50vgzjssefzmld0kfkt7sfvejgel9znun9chsc82k09xfess5qqu8qyc", // Ozone v2 underwriting master pool
  },
};

async function getManagedVaults(vaultManager, block, chain) {
  let res = [];
  const { output: managedVaults } = await sdk.api.abi.call({
    abi: vaultManagerAbi,
    target: vaultManager,
    block,
    chain,
  });

  let calls = [];
  managedVaults.forEach((vault) => {
    calls.push({
      target: vault,
    });
  });

  const { output: vaultStoragesResult } = await sdk.api.abi.multiCall({
    abi: vaultAbi,
    calls,
    block,
    chain,
  });

  // Join the two arrays into [[underwritingToken, vaultAddr]]
  vaultStoragesResult.forEach((vaultStorageResult) => {
    if (vaultStorageResult.success) {
      const underwritingToken =
        vaultStorageResult.output.config.underwritingToken;
      res.push([underwritingToken, vaultStorageResult.input.target]);
    }
  });

  return res;
}

async function terra2(timestamp, ethBlock, chainBlocks, { api }) {
  const { addresses } = await queryContract({
    contract: networks.terra2.factory,
    chain: "terra2",
    data: {
      get_vaults: {},
    },
  });

  // 09-28-22 As of now, the only asset supported for deposit
  // is Luna2 in the form of wrapped Luna2 since RH Ozone v2 does
  // not support native token types
  // For each vault, query its wrapped LUNA2 balance
  for (const address of addresses) {
    const { balance } = await queryContract({
      contract: networks.terra2.wrapped_luna,
      chain: 'terra2',
      data: { balance: { address: address } }
    })
    api.add('terra-luna-2', balance / 1e6)
  }

  return sumTokensCosmos({ balances: api.getBalances(), owner: networks.terra2.masterPool, chain: "terra2", })
}

async function terra(timestamp, ethBlock, chainBlocks) {
  return sumTokensCosmos({ owners: networks.terra.vaults, chain: "terra" });
}

function evm(chainName) {
  return async (timestamp, block, chainBlocks, { api }) => {
    const network = networks[chainName];

    if (network.vaultManager) {
      const managedVaults = await getManagedVaults(
        network.vaultManager,
        api.block,
        chainName
      );
      network.vaults = [...network.vaults, ...managedVaults];
    }

    return sumTokens(
      undefined,
      network.vaults,
      api.block,
      chainName,
    );
  };
}

module.exports = {
  timetravel: false,
  methodology: "Amount of underwriter capital inside the protocol",
  terra: {
    tvl: terra,
  },
  terra2: {
    tvl: terra2,
  },
  ethereum: {
    tvl: evm("ethereum"),
  },
  arbitrum: {
    tvl: evm("arbitrum"),
  },
  avax: {
    tvl: evm("avax"),
  },
  fantom: {
    tvl: evm("fantom"),
  },
  aurora: {
    tvl: evm("aurora"),
  },
  optimism: {
    tvl: evm("optimism"),
  },
  polygon: {
    tvl: evm("polygon"),
  },
  hallmarks: [[1651881600, "UST depeg"]],
};
