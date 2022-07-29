const sdk = require("@defillama/sdk");
const { queryV1Beta1 } = require("../helper/terra");
const { sumTokens } = require("../helper/unwrapLPs");

const networks = {
  ethereum: {
    vaults: [
      // [underwritingAsset, vaultAddress]
      [
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0x83944C256e5C057A246aE1b1945934440eb35Af6",
      ],
      [
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0x8D999a2f262FfDA47A734B987D1A15bc984e45Be",
      ],
      [
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0x0881Ec8e0e743906E1c1dFeE8Ae12BfDc0611b24",
      ],
      [
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0x8529687adD661120C9E23E366Cc7F545f1A03ADf",
      ],
    ],
  },
  arbitrum: {
    vaults: [
      [
        "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        "0x207472891AF32F5636c35d9ca8e17464Df7108bB",
      ],
    ],
  },
  avax: {
    vaults: [
      [
        "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        "0x2DafE4DD7C661c2CEaf967d51206f5130AA32782",
      ],
      [
        // Count av3CRV in the above vault too
        "0x1337BedC9D22ecbe766dF105c9623922A27963EC",
        "0x2DafE4DD7C661c2CEaf967d51206f5130AA32782",
      ],
      [
        "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        "0xBe09C11d28683E283fdf7566DE1685A6A221B6bf",
      ],
    ],
  },
  fantom: {
    vaults: [
      [
        "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
        "0xca67B16b02E418CFbC9EF287C7C20B77dbb665f2",
      ],
    ],
  },
  aurora: {
    vaults: [
      [
        "0xb12bfca5a55806aaf64e99521918a4bf0fc40802",
        "0x8D999a2f262FfDA47A734B987D1A15bc984e45Be",
      ],
    ],
  },
  terra: {
    vaults: [
      "terra1dlfz2teqt5shxuw87npfecjtv7xlrxvqd4sapt", // Ozone v1 pool 1
      "terra1h6t8gx7jvc2ens9nrxcf9vqylzquey75e2wvzt", // Ozone v1 pool 2
    ],
  },
  terra2: {
    vaults: [
      "terra1gz50vgzjssefzmld0kfkt7sfvejgel9znun9chsc82k09xfess5qqu8qyc", // Ozone v2 underwriting master pool
    ],
  },
};

async function terra2(timestamp, ethBlock, chainBlocks) {
  const balances = { "terra-luna-2": 0 };
  for (const vaultAddr of networks.terra2.vaults) {
    let paginationKey;

    do {
      const data = await queryV1Beta1(
        `bank/v1beta1/balances/${vaultAddr}`,
        paginationKey,
        chainBlocks.terra2,
        { isTerra2: true }
      );

      paginationKey = data.pagination.next_key;

      data.balances.forEach(({ denom, amount }) => {
        // Ozone V2 is underwritten in luna
        if (denom === "uluna") {
          balances["terra-luna-2"] += parseInt(amount) / 1e6;
        }
      });
    } while (paginationKey);
  }
  return balances;
}

async function terra(timestamp, ethBlock, chainBlocks) {
  let block;
  const balances = { terrausd: 0 };

  for (const vaultAddr of networks.terra.vaults) {
    let paginationKey;

    do {
      const data = await queryV1Beta1(
        `bank/v1beta1/balances/${vaultAddr}`,
        paginationKey,
        chainBlocks.terra
      );

      paginationKey = data.pagination.next_key;

      data.balances.forEach(({ denom, amount }) => {
        /**
         * 3/10/2022 - As of now the only supported underwriting token for Risk Harbor Ozone is UST, so
         * balances should always be an array of length 1. Added support for dynamic balances length, denom checking, and pagination for
         * future proofing and safety.
         */
        if (denom === "uusd") {
          balances["terrausd"] += parseInt(amount) / 1e6;
        }
      });
    } while (paginationKey);
  }
  return balances;
}

function evm(chainName) {
  return async (timestamp, block, chainBlocks) => {
    const balances = {};
    const network = networks[chainName];
    if (chainName === "ethereum") {
      await sumTokens(balances, network.vaults, block);
    } else {
      await sumTokens(
        balances,
        network.vaults,
        chainBlocks[chainName],
        chainName,
        null,
        {
          resolveCrv: true,
        }
      );
    }
    return balances;
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
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
  avalanche: {
    tvl: evm("avax"),
  },
  fantom: {
    tvl: evm("fantom"),
  },
  aurora: {
    tvl: evm("aurora"),
  },
};
