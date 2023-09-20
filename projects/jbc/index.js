const ADDRESSES = require('../helper/coreAssets.json')
const { pool2, staking } = require("../helper/unknownTokens");
const { nullAddress, sumTokensExport, } = require("../helper/unwrapLPs");

const tokensAndOwners = [
  [ADDRESSES.arbitrum.fsGLP, '0xe964b6083F24dBC06e94C662b195c22C76923b22'], // GLP
  [nullAddress, '0x64f688cACeFe6D4809f1A829c1d0286100196bE0'], // ETH
  [ADDRESSES.arbitrum.WBTC, '0xCC13E077F54577cE3Ea52916fDd70305C461A3ED'], // WBTC
  [ADDRESSES.arbitrum.USDC, '0xcA2F482B067D354B3cdB6926911f42F5d1f0e872'], // USDC
]
const lpToken = '0x85c6da933a7451bf2a6d836304b30967f3e76e11'

module.exports = {
  hallmarks: [
    [1681516800, "Rug Pull"]
  ],
  arbitrum: {
    tvl: sumTokensExport({ tokensAndOwners }),
    pool2: pool2({ stakingContract: '0x0F6f73c7ecCE4FB9861E25dabde79CBA112550b3', lpToken, useDefaultCoreAssets: true, }),
    staking: staking({owner: "0xaF70e6DF6d34dbcd284BC4CCa047Bd232110A2CF", tokens: ["0xb67c175701fD60cD670cB9D331368367BF072e47"], lps: [lpToken]})
  }
}