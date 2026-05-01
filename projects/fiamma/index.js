const { function_view } = require("../helper/chain/aptos");

const FIAMMA_BTC_EVM = {
  ethereum:    "0x22F0E0a4c97ff43546dad16d43Ef854C773F0e08",
  arbitrum:    "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  base:        "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  polygon:     "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  bsc:         "0xafB253A80CEb3d1a5eeF3994C0d1C92c2f027524",
  sei:         "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  core:        "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  unichain:    "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  plume_mainnet: "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  hyperliquid: "0x0CEDa114F533D540c8aF2AeB52942c1a4A0B1e86",  // HyperEVM slug
};

const APTOS_FIAMMA_BTC_METADATA =
  "0x75de592a7e62e6224d13763c392190fda8635ebb79c798a5e9dd0840102f3f93";

const BTC_DECIMALS = 1e8;

const evmTvl = (chain) => async (api) => {
  try {
    const supply = await api.call({
      target: FIAMMA_BTC_EVM[chain],
      abi:    "erc20:totalSupply",
      chain,
    });
    if (!supply || supply === "0") return;
    api.addCGToken("bitcoin", Number(supply) / BTC_DECIMALS);
  } catch (_) {}
};

const aptosTvl = async (api) => {
  try {
    const supply = await function_view({
      functionStr:     "0x1::fungible_asset::supply",
      type_arguments:  ["0x1::fungible_asset::Metadata"],
      args:            [APTOS_FIAMMA_BTC_METADATA],
      chain:           "aptos",
    });
    const raw = supply?.vec?.[0] ?? supply;
    if (!raw) return;
    api.addCGToken("bitcoin", Number(raw) / BTC_DECIMALS);
  } catch (_) {}
};

module.exports = {
  methodology:
    "TVL = total supply of FiammaBTC tokens across all chains. " +
    "Each FiammaBTC token represents 1 satoshi of Bitcoin locked in the " +
    "Fiamma BitVM2 trust-minimized bridge.",

  ethereum:      { tvl: evmTvl("ethereum")      },
  arbitrum:      { tvl: evmTvl("arbitrum")      },
  base:          { tvl: evmTvl("base")          },
  polygon:       { tvl: evmTvl("polygon")       },
  bsc:           { tvl: evmTvl("bsc")           },
  sei:           { tvl: evmTvl("sei")           },
  core:          { tvl: evmTvl("core")          },
  unichain:      { tvl: evmTvl("unichain")      },
  plume_mainnet: { tvl: evmTvl("plume_mainnet") },
  hyperliquid:   { tvl: evmTvl("hyperliquid")   },
  aptos:         { tvl: aptosTvl               },
};