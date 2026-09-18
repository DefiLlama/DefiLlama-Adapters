const sdk = require('@defillama/sdk')
const abi = {
  "vaultDebtVal": "uint256:vaultDebtVal",
  "totalToken": "uint256:totalToken",
  "token": "address:token",
  "pid": "uint256:pid",
  "reservePool": "uint256:reservePool",
  "balanceOf": "function balanceOf(address account) view returns (uint256)",
  "totalSupply": "uint256:totalSupply",
  "lpToken": "address:lpToken",
  "userInfo": "function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)",
  "userInfoCake": "function userInfo(address) view returns (uint256 shares, uint256 lastDepositedTime)",
  "singleAssetPrice": "uint256:getPricePerFullShare",
  "pId": "uint256:pid",
  "ausdTotalStablecoinIssued": "uint256:totalStablecoinIssued",
  "xalpacaTotalSupply": "uint256:supply"
};
const { getConfig } = require('../helper/cache')
const { calLyfTvl } = require("./lyf");
const aExports = require('../alpaca-finance-lend');

// ===== inlined from ./ausd =====
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

// ===== inlined from ./xalpaca =====
async function getProcolXAlpacaAddresses(chain) {
  if (chain == "bsc") {
    return (
      await getConfig('alpaca-finance/x-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/xALPACA-contract/main/.mainnet.json"
      )
    )
  }
  if (chain == "fantom") {
    return (
      await getConfig('alpaca-finance/x-fantom',
        "https://raw.githubusercontent.com/alpaca-finance/xALPACA-contract/main/.fantom_mainnet.json"
      )
    )
  }
}

async function calxALPACAtvl(api) {
  const xalpacaAddresses = await getProcolXAlpacaAddresses(api.chain);

  const xalpacaTVL = await api.call({ abi: abi.xalpacaTotalSupply, target: xalpacaAddresses["xALPACA"], })
  const alpacaAddress = xalpacaAddresses["Tokens"]["ALPACA"];
  api.add(alpacaAddress, xalpacaTVL)
}

module.exports = {
  start: '2020-10-07',
  bsc: {
    tvl: sdk.util.sumChainTvls([calLyfTvl, calAusdTvl, aExports.bsc.tvl]),
    staking: calxALPACAtvl,
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([calLyfTvl, aExports.fantom.tvl]),
    staking: calxALPACAtvl,
  }
};
