const abi = require("./abi.json");
const depositor = '0xC204501F33eC40B8610BB2D753Dd540Ec6EA2646';
const { pool2s } = require("../helper/pool2");
const { staking } = require("../helper/staking");

async function addMasterchefFunds(masterChef, api) {
  const infos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: masterChef })
  const calls = infos.map((_, i) => ({ params: [i, depositor] }))
  const userInfo = await api.multiCall({ abi: abi.userInfo, calls, target: masterChef })
  const lpTokens = infos.map(i => i.lpToken)
  const supplies = await api.multiCall({ abi: abi.totalSupply, calls: lpTokens })
  const underlyingBalance = await api.multiCall({ abi: abi.underlyingBalance, calls: lpTokens })
  const underlyingToken = await api.multiCall({ abi: abi.underlyingToken, calls: lpTokens })


  for (let i = 0; i < userInfo.length; i++) {
    api.add(underlyingToken[i], userInfo[i].amount * underlyingBalance[i] / supplies[i])
  }
}

async function tvl(api) {
  await addMasterchefFunds("0xb0523f9f473812fb195ee49bc7d2ab9873a98044", api)
  await addMasterchefFunds("0x68c5f4374228BEEdFa078e77b5ed93C28a2f713E", api)
}

const pool2LPs = ["0x218e6A0AD170460F93eA784FbcC92B57DF13316E", "0xc8898e2eEE8a1d08742bb3173311697966451F61"]

module.exports = {
  deadFrom: '2024-06-16',
  doublecounted: true,
  avax: {
    tvl,
    pool2: pool2s(["0xc9AA91645C3a400246B9D16c8d648F5dcEC6d1c8"], pool2LPs),
    staking: staking("0x721C2c768635D2b0147552861a0D8FDfde55C032", "0xeb8343D5284CaEc921F035207ca94DB6BAaaCBcd")
  }
};