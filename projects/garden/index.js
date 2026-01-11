const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/sumTokens");
const sdk = require("@defillama/sdk");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");
const { methodology } = require("../allinx.js");

const SEED_TOKEN_ADDRESS = "0x86f65121804D2Cdbef79F9f072D4e0c2eEbABC08"; // SEED TOKEN (Garden's Governance Token) Address
const STAKING_CONTRACT_ADDRESS = "0xe2239938Ce088148b3Ab398b2b77Eedfcd9d1AfC";
const COBI_EVM_ADDRESSES = [
  "0x91f31778BbF08a75404b332a5bDB65BDde634e25", // solver_id = "0xa3c4b7f912e8f56d9b2a1ec44b0c578a9fe12c8d"
  "0x18e489f22461281879e1d161c55668b7a521a3a9", //solver_id = "0x18e489f22461281879e1d161c55668b7a521a3a9"
  "0xa7452C30640003a0587c7715cd79Ef70aFe2d1B1" //solver_id = "0x189d31bc1a6f195abc4d099d2d129b3166760543"
];
const COBI_STARKNET_ADDRESSES = [
  "0x18541b15b2f8d8c1356c0fc2aa23b9972b12204abd07b50287caa6abdd1a157",
  "0x79fbf0c5c95b82d206e81f0d9a77b8a6a81bfa367d65b729b0b1d602bccc018"
];
const UNICHAIN_WBTC = "0x927B51f251480a681271180DA4de28D44EC4AfB8";
const HYPEREVM_UBTC = "0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463";
const STARKNET_WBTC = "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac";

module.exports = {
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.garden }),
    ]),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.USDC,
        "0x20157dbabb84e3bbfe68c349d0d44e48ae7b5ad2",
        ADDRESSES.ethereum.cbBTC,
        ADDRESSES.ethereum.USDT,
        nullAddress,
      ],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [
        ADDRESSES.arbitrum.WBTC,
        "0x050c24dbf1eec17babe5fc585f06116a259cc77a",
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDC_CIRCLE,
      ],
    }),
    staking: sumTokensExport({
      owners: [STAKING_CONTRACT_ADDRESS],
      tokens: [SEED_TOKEN_ADDRESS],
    }),
  },
  berachain: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [ADDRESSES.corn.LBTC],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [ADDRESSES.base.USDC, ADDRESSES.base.cbBTC, nullAddress],
    }),
  },
  unichain: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [ADDRESSES.unichain.USDC, UNICHAIN_WBTC]
    })
  },
  hyperliquid: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [HYPEREVM_UBTC]
    })
  },
  starknet: {
    tvl: sumTokensExport({
      owners: COBI_STARKNET_ADDRESSES,
      tokens: [STARKNET_WBTC],
    })
  },
  monad: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [ADDRESSES.null, ADDRESSES.monad.USDC],
    })
  },


  btnx: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [ADDRESSES.null],
    })
  },

  bsc: {
    tvl: sumTokensExport({
      owners: COBI_EVM_ADDRESSES,
      tokens: [ADDRESSES.bsc.BTCB,],
    })
  }
};

