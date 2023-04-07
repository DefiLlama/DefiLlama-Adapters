const { pool2 } = require("../helper/unknownTokens");
const { nullAddress, sumTokensExport, } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const tokensAndOwners = [
  ['0x1addd80e6039594ee970e5872d247bf0414c8903', '0xe964b6083F24dBC06e94C662b195c22C76923b22'], // GLP
  [nullAddress, '0x64f688cACeFe6D4809f1A829c1d0286100196bE0'], // ETH
  ['0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', '0xCC13E077F54577cE3Ea52916fDd70305C461A3ED'], // WBTC
  ['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', '0xcA2F482B067D354B3cdB6926911f42F5d1f0e872'], // USDC
]

function staking(stakingAddr, token, chain) {
  return async (_timestamp, _block, chainBlocks) => {
    let balances = {};
    let balance = (
      await sdk.api.erc20.balanceOf({
        target: token,
        owner: stakingAddr,
        block: chainBlocks[chain],
        chain,
      })
    ).output;
    sdk.util.sumSingleBalance(balances, `arbitrum:${token}`, balance);
    return balances;
  };
}

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ tokensAndOwners }),
    pool2: pool2({ stakingContract: '0x0F6f73c7ecCE4FB9861E25dabde79CBA112550b3', lpToken: '0x85c6da933a7451bf2a6d836304b30967f3e76e11', chain: 'arbitrum', useDefaultCoreAssets: true, }),
    staking: staking("0xaF70e6DF6d34dbcd284BC4CCa047Bd232110A2CF", "0xb67c175701fD60cD670cB9D331368367BF072e47", "arbitrum")
  }
};

