const sdk = require('@defillama/sdk');
const { sumTokensExport: sumBRC20TokensExport } = require("../helper/chain/brc20");
const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

const BTCOwners = [
  // pre deposited wallets //Bitcoin Multisig Addresses
  "bc1q4fsk5pgnmnu7ngp79xclsw2t0yk46sjqw22ffz",
  "bc1qva5m5e7da2zm590z03tdnj42u9q2uye3hgrehwrzgg8j4kxq9seq9rvw0m", //Bitcoin Multisig Addresses
  "bc1qjv2lfrv672rqagycs5zdsggmury0cz2vufek46jj86ddqynyp2qsxm3qfs", //Bitcoin Multisig Addresses
  //Bitcoin Custodian Addresses
  "131fpYjELat58RVzPp2A9Bo8oNuKiP4vxg",
  "bc1qr4cpjazz6hhjh44yrshqw4xs4e3eld60wnsq2m",
  "14UwPgMLZY6rLZRDxxvmNWQ9rMkg2iraHG",
  "bc1quetqhxs809mwgms0rhae4cw98chzqe0er8fryr",
  "34ThPcBtz5ayRybbg1MXnQWBGtUzqUDCMa",
  "bc1q082azm83lgpln7puvn4egc9dumlaqfqkqmsght",
  "bc1qxxgxywxcq0q405849fyrlxa2zu4nxukf4ytg57",
  "3LcCJLivWmaomMyhnyt4pqg8iWi2ECU92T",
  "bc1qe4xx7eg5c4qjq8838zv05f7uzfmyyyftdpy48t",
  "3GPVsXtvbfFNRYbLwJowaL7EXo8hqakfkv",
  "bc1q8axfvwqa0fqds5w6vva9g5kej9e4mp4ap3dmff",
  "bc1q6crqwsg59s2j4v5gvd94775pjj8l0fmflmv9jd",
  "19M7Z1E8Bs4pkXmHJrrJtngmVMUmgFu4K2"
];

const BRC20Owners = [
  "bc1q97ctqygjgj0ljxgge4q735ujxvlad8smass7f0axc6x3ggffr8xqwn69hc", //Bitcoin Multisig Addresses
];

const ADDRESSES_ETHEREUM_STONE = '0x7122985656e38BDC0302Db86685bb972b145bD3C';

module.exports = {
  hallmarks: [
    [1710259680, "Cease pre-deposit"],
  ],
  methodology: "Staking tokens via BSquared Network Buzz counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: BTCOwners }),
      sumBRC20TokensExport({ owners: BRC20Owners }),
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
