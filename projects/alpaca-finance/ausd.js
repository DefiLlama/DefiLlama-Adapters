const abi = require("./abi.json");
const { getConfig } = require('../helper/cache')

async function getProcolAUSDAddresses(chain) {
  if (chain == "bsc") {
    return (
      await getConfig('alpaca-finance/ausd-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/alpaca-stablecoin/main/.mainnet.json"
      )
    );
  }
}

async function getProcolLYFAddresses(chain) {
  if (chain == "bsc") {
    return (
      await getConfig('alpaca-finance/lyf-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
      )
    );
  }
  if (chain == "fantom") {
    return (
      await getConfig('alpaca-finance/lyf-fantom',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.fantom_mainnet.json"
      )
    );
  }
}

async function calAusdTvl(api) {
  const chain = api.chain;

  const ausdAddresses = await getProcolAUSDAddresses(chain);
  const lyfAddresses = await getProcolLYFAddresses(chain);
  const ibTokens = ausdAddresses["IbTokenAdapters"].map((i) => i.address)
  const pids = await api.multiCall({ abi: abi.pid, calls: ibTokens });
  const failaunchUserInfos = await api.multiCall({
    abi: abi.userInfo,
    target: lyfAddresses["FairLaunch"].address,
    calls: pids.map((each, i) => {
      return {
        params: [each, ibTokens[i]],
      };
    }),
  });
  const collateralTokens = ausdAddresses.IbTokenAdapters.map((each) => each.collateralToken);
  const totalTokens = await api.multiCall({ abi: abi.totalToken, calls: collateralTokens });
  const totalSupplys = await api.multiCall({ abi: abi.totalSupply, calls: collateralTokens, });
  const vaultTokens = await api.multiCall({ abi: abi.token, calls: collateralTokens, });

  failaunchUserInfos.forEach((eachUserInfo, i) => {
    api.add(vaultTokens[i], eachUserInfo.amount * totalTokens[i] / totalSupplys[i]);
  })
  return api.getBalances()
}

module.exports = {
  calAusdTvl,
};
