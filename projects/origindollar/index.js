const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking, stakings } = require("../helper/staking");

const vault = "0xE75D77B1865Ae93c7eaa3040B038D7aA7BC02F70";

const ethTvl = async (timestamp, ethBlock) => {
  const balances = {};

  // Account DAI, USDT and USDC backing up the minted OUSD
  const stablecoins = (
    await sdk.api.abi.call({
      abi: abi.getAllAssets,
      target: vault,
      block: ethBlock,
    })
  ).output;

  for (let i = 0; i < stablecoins.length; i++) {
    const balance_stablecoin = (
      await sdk.api.abi.call({
        abi: abi.checkBalance,
        target: vault,
        params: stablecoins[i],
        block: ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, stablecoins[i], balance_stablecoin);
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: stakings(
      ["0x0C4576Ca1c365868E162554AF8e385dc3e7C66D9", "0x63898b3b6Ef3d39332082178656E9862bee45C57"],
      ["0x9c354503C38481a7A7a51629142963F98eCC12D0", "0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26"]
    ),
  },
};
