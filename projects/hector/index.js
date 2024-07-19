const { staking } = require('../helper/staking')
const contracts = require("./contracts.json");
const { sumTokens2, unwrapLPsAuto } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const { genericUnwrapCvx } = require("../helper/unwrapLPs");

async function walletBalances(api) {
  const { owners = [], blacklistedTokens } = contracts.tokenHolders[api.chain]
  return sumTokens2({ api, owners, fetchCoValentTokens: true, blacklistedTokens, tokenConfig: { onlyWhitelisted: false, } })
}
async function deployedBalances(api) {
  switch (api.chain) {
    case "bsc":
      return getPancakeDeposits(api, "0xa5f8c5dbd5f286960b9d90548680ae5ebff07652", [2, 4, 14], "0x3cdf52cc28d21c5b7b91d7065fd6dfe6d426fcc5",);
    case "ethereum":
      return getConvexDeposits(api, "0xf403c135812408bfbe8713b5a23a04b3d48aae31", [61, 64], "0x4bfb33d65f4167ebe190145939479227e7bf2cb0",);
  }
}
async function getConvexDeposits(api, target, poolIds, owner,) {
  let poolInfos = await api.multiCall({ abi: abi.poolInfo, target, calls: poolIds, })
  return Promise.all(poolInfos.map(i => genericUnwrapCvx(api.getBalances(), owner, i.crvRewards, api.block, api.chain)))
}

async function getPancakeDeposits(api, target, poolIds, owner,) {
  const [balance, lpToken] = await Promise.all([
    api.multiCall({ abi: abi.userInfo, target, calls: poolIds.map(i => ({ params: [i, owner] })), }),
    api.multiCall({ abi: abi.lpToken, target, calls: poolIds, })
  ]);
  lpToken.forEach((v, i) => api.add(v, balance[i].amount))
}

module.exports = {
  ethereum: { tvl, },
  fantom: {
    tvl,
    staking: staking('0xd12930c8deedafd788f437879cba1ad1e3908cc5', '0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0')
  },
  bsc: { tvl, }
};

async function tvl(api) {
  const calls = [
    walletBalances(api),
    deployedBalances(api),
  ]
  await Promise.all(calls)

  await unwrapLPsAuto({ api, })
}
