const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/sumTokens");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: "Staking tokens via AlexLab counts as TVL",
  bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.xlink }) },
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x7ceC01355aC0791dE5b887e80fd20e391BCB103a",
        "0xcD0cb6AA811E1c8cD9A55EcB9Cc83f6a50Bed311",
        "0x13b72A19e221275D3d18ed4D9235F8F859626673",
      ],
      tokens: [ADDRESSES.ethereum.WBTC, ADDRESSES.null],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [
        "0x7ceC01355aC0791dE5b887e80fd20e391BCB103a",
        "0xcD0cb6AA811E1c8cD9A55EcB9Cc83f6a50Bed311",
        "0xFFda60ed91039Dd4dE20492934bC163e0F61e7f5",
      ],
      tokens: [
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.BTCB,
      ],
    }),
  },
  stacks: {
    tvl: sumTokensExport({
      owners: [
        "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.cross-bridge-registry-v2-01",
        "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.btc-peg-out-endpoint-v2-01",
      ],
      blacklistedTokens: [
        "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc::bridged-btc",
        "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex",
      ],
    }),
  },
  bsquared: {
    tvl: sumTokensExport({
      owners: [
      '0x10eeCCc43172458F0ff9Cc3E9730aB256fAEE32e'
      ],
      tokens: [
        ADDRESSES.bsquared.UBTC
      ]
    }),
  }  
};
