const sdk = require('@defillama/sdk');
const { sumTokensExport: sumBRC20TokensExport } = require("../helper/chain/brc20");
const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

const BTCOwners = [
  "bc1q4fsk5pgnmnu7ngp79xclsw2t0yk46sjqw22ffz",
  "bc1qva5m5e7da2zm590z03tdnj42u9q2uye3hgrehwrzgg8j4kxq9seq9rvw0m",
  "bc1qjv2lfrv672rqagycs5zdsggmury0cz2vufek46jj86ddqynyp2qsxm3qfs",
];
const BRC20Owners = [
  "bc1q97ctqygjgj0ljxgge4q735ujxvlad8smass7f0axc6x3ggffr8xqwn69hc",
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
        [[ADDRESSES_ETHEREUM_STONE, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.WBTC], "0xeea3A032f381AB1E415e82Fe08ebeb20F513c42c",],
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
        [[ADDRESSES.bsc.BTCB, ADDRESSES.ethereum.FDUSD], "0x0A80028d73Faaee6e57484E3335BeFda0de7f455",],
      ]
    }),
  },
  bsquared: {
        tvl: sumTokensExport({
            ownerTokens: [
                [
                    [
                        ADDRESSES.null,
                        ADDRESSES.bsquared.USDT,
                        ADDRESSES.bsquared.USDC,
                        ADDRESSES.bsquared.WBTC,
                        "0x7537C1F80c9E157ED7AFD93a494be3e1f04f1462", // BSTONE
                        "0xC2Fe4f673455Ef92299770a09CDB5E8756A525D5", // FDUSD
                        "0xc3ee2Df14B1Bc526c24ED802f1873d49664a0d5c", // MATIC
                        "0xa0f4470B714677AEEcE0d20074c540b3Cf6a477E", // ordi
                        "0x7eBFcE05E418C380a2b6EB0F65995cA04ef4bc00", // sats
                    ],
                    "0x463d0908ba1F21B791883a6c27Aa82d293Dd0f69",
                ],
                [
                    [
                        ADDRESSES.null,
                        ADDRESSES.bsquared.USDT,
                        ADDRESSES.bsquared.USDC,
                        ADDRESSES.bsquared.WBTC,
                        "0x7537C1F80c9E157ED7AFD93a494be3e1f04f1462", // BSTONE
                        "0xC2Fe4f673455Ef92299770a09CDB5E8756A525D5", // FDUSD
                        "0xc3ee2Df14B1Bc526c24ED802f1873d49664a0d5c", // MATIC
                        "0xa0f4470B714677AEEcE0d20074c540b3Cf6a477E", // ordi
                        "0x7eBFcE05E418C380a2b6EB0F65995cA04ef4bc00", // sats
                    ],
                    "0x9683826a04db8ae2e256e6a14b87d440c7105824",
                ],
            ]
        }),
    },
};
