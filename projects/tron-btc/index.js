const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: "Collateral for BTC on tron chain",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.tronBTC }),
    ]),
  },
  ethereum: {
    tvl: sumTokensExport({
      ownerTokens: [
        [[ADDRESSES.ethereum.WBTC], "0xbe6d2444a717767544a8b0ba77833aa6519d81cd",], //WBTC
        [["0xc96de26018a54d51c097160568752c4e3bd6c364"], "0x38d516a43f9bab90455c16f9299866217062467e",],//FBTC 
] 
    }),
  },
  merlin: {
    tvl: sumTokensExport({
      owners: ["0x06fe862f2eefe9a5e9a2cf9799941706665e833a"],
      tokens: [ADDRESSES.merlin.WBTC_1, "0x93919784c523f39cacaa98ee0a9d96c3f32b593e"] // M-BTC AND UNIBTC
    }),
  },
  zklink: {
    tvl: sumTokensExport({
      owners: ["0x3aa95613091a3a9512956c3a2a2b724dce375a2d"],
      tokens: ["0xbeaf16cfd8efe0fc97c2a07e349b9411f5dc272c"] // SolvBTC.m
    }),
  },
  linea: {
    tvl: sumTokensExport({
      owners: ["0x399c4e524cff47d9e670f9d1ca0381bbe746e97a", "0x533806b821ec94091228d7d34e697b93bb79f8f6"],
      tokens: ["0xe4d584ae9b753e549cae66200a6475d2f00705f7", "0x5ffce65a40f6d3de5332766fff6a28bf491c868c", "0x96155858a02c410c3c814bb32fdc413b3241b62e"] // m-btc, SolvBTC.m , solvBTC.B
    }),
  },
  mode: {
    tvl: sumTokensExport({
      owners: ["0x399c4e524cff47d9e670f9d1ca0381bbe746e97a", "0x533806b821ec94091228d7d34e697b93bb79f8f6"],
      tokens: ["0x59889b7021243db5b1e065385f918316cd90d46c", ] // m-btc
    }),
  },
  core: {
    tvl: sumTokensExport({
      owners: ["0x533806b821ec94091228d7d34e697b93bb79f8f6"],
      tokens: ["0xe04d21d999faedf1e72ade6629e20a11a1ed14fa", ] // solvBTC.M
    }),
  },
  kroma: {
    tvl: sumTokensExport({
      owners: ["0x533806b821ec94091228d7d34e697b93bb79f8f6"],
      tokens: ["0x0f921c39efd98809fe6d20a88a4357454578987a", ] // m-BTC
    }),
  },
  kava: {
    tvl: sumTokensExport({
      owners: ["0x533806b821ec94091228d7d34e697b93bb79f8f6"],
      tokens: ["0x59889b7021243db5b1e065385f918316cd90d46c", ] // m-BTC
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x533806b821ec94091228d7d34e697b93bb79f8f6"],
      tokens: [ADDRESSES.bsc.BTCB, ] // BTCB
    }),
  },
};