const sdk = require('@defillama/sdk');
const { sumTokensExport: sumBRC20TokensExport } = require("../helper/chain/brc20");
const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const ADDRESSES_ETHEREUM_STONE = '0x7122985656e38BDC0302Db86685bb972b145bD3C';

module.exports = {
  hallmarks: [
    [1710259680, "Cease pre-deposit"],
  ],
  methodology: "Staking tokens via BSquared Network Buzz counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.bsquaredBTC }),
      sumBRC20TokensExport({ owners: bitcoinAddressBook.bsquaredBRC20 }),
    ]),
  },
  ethereum: {
    tvl: sumTokensExport({
      ownerTokens: [
        [[ADDRESSES_ETHEREUM_STONE, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.WBTC], "0xeea3A032f381AB1E415e82Fe08ebeb20F513c42c",], //Ethereum Multisignature Address (WBTC)
      ]
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      ownerTokens: [
        [[ADDRESSES.null], "0x01cE88498ED095d386e09834D32Fd8f1FeCd184a",],
      ]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      ownerTokens: [
        [[ADDRESSES.bsc.BTCB, ADDRESSES.ethereum.FDUSD], "0x0A80028d73Faaee6e57484E3335BeFda0de7f455",], //BNB Chain Multisig Address (BTCB)
      ]
    }),
  },
};
