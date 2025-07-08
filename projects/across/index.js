const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getLogs } = require('../helper/cache/getLogs')


const hubPoolAddress = "0xc186fA914353c44b2E33eBE05f21846F1048bEda"

let pools = [
  // bridge pools
  [ADDRESSES.ethereum.USDC, "0x256c8919ce1ab0e33974cf6aa9c71561ef3017b6"],
  [ADDRESSES.ethereum.WETH, "0x7355efc63ae731f584380a9838292c7046c1e433"],
  ["0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828", "0xdfe0ec39291e3b60aca122908f86809c9ee64e90"],
  ["0x3472A5A71965499acd81997a54BBA8D852C6E53d", "0x43298f9f91a4545df64748e78a2c777c580573d6"],
  [ADDRESSES.ethereum.WBTC, "0x02fbb64517e1c6ed69a6faa3abf37db0482f1152"],
  ["0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc", "0x4841572daa1f8e4ce0f62570877c2d0cc18c9535"],
  [ADDRESSES.ethereum.DAI, "0x43f133fe6fdfa17c417695c476447dc2a449ba5b"],
]

async function tvl(api) {
  const v2Logs = await getLogs({
    api,
    target: hubPoolAddress,
    topic: "L1TokenEnabledForLiquidityProvision(address,address)",
    fromBlock: 14819537,
    eventAbi: 'event L1TokenEnabledForLiquidityProvision (address l1Token, address lpToken)',
  });
  pools = pools.map(i => i.map(j => j.toLowerCase()))
  v2Logs.map((log) => log.args).forEach(i => {
    const pool = i[1].toLowerCase()
    if (pools.some(i => i[1] === pool)) return;
    pools.push([i[0], pool])
  })
  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: pools.map(i => i[1]),
  })

  const balances = {}
  supplies.forEach((output, i) => sdk.util.sumSingleBalance(balances, pools[i][0], output, 'ethereum'))
  return balances
}

module.exports = {
  ethereum: {
    tvl,
  }
};