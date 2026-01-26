
const abi = {
    "balance": "uint:balance",
    "collateral": "address:collateral",
    "CreateEscrow": "event CreateEscrow(address indexed user, address escrow)",
    "AddMarket": "event AddMarket(address indexed market)"
  };
const { getLogs } = require('../helper/cache/getLogs')
const sdk = require("@defillama/sdk")
const { staking } = require('../helper/staking')

// Firm
const firmStart = 16159015;
const DBR = '0xAD038Eb671c44b853887A7E32528FaB35dC5D710';

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: DBR,
    topics: ['0xc3dfb88ee5301cecf05761fb2728064e5b641524346ae69b9ba80394631bf11f'],
    fromBlock: firmStart,
    eventAbi: abi.AddMarket,
    extraKey: "fix-firm"
  })

  // unique markets
  const markets = [...new Set(logs.map(i => i.args.market))]
  const collateral = await api.multiCall({ abi: 'address:collateral', calls: markets })
  const symbols = await api.multiCall({ abi: 'string:name', calls: collateral })
  const versions = await api.multiCall({ abi: 'string:version', calls: collateral, permitFailure: true })

  let escrows = await Promise.all(
    markets.map(async (m, idx) => {
      const symbol = symbols[idx]
      const token = collateral[idx]

      const logs = await getLogs({
        api,
        target: m,
        topic: "CreateEscrow(address,address)",
        fromBlock: firmStart,
        eventAbi: abi.CreateEscrow,
      })

      return logs.map(i => i.args.escrow)
    })
  );
  escrows = escrows.flat()
  const tokens = await api.multiCall({ abi: 'address:token', calls: escrows })
  const tokenBalances = await api.multiCall({ abi: 'uint256:balance', calls: escrows })
  const balancesTemp = {}
  tokens.forEach((t, i) => {
    const tokenLower = t.toLowerCase()
    if (!balancesTemp[tokenLower]) balancesTemp[tokenLower] = 0
    balancesTemp[tokenLower] += +tokenBalances[i].toString()
  })

  const uTokens = [...new Set(tokens.map(i => i.toLowerCase()))]
  const uTokenSymbols = await api.multiCall({ abi: 'string:symbol', calls: uTokens })

  // unwrap yvCurve-DOLA
  const yvCurveTokens = uTokens.filter((_, i) => uTokenSymbols[i].startsWith('yvCurve-'))
  const yvCurveUnderlyings = (await api.multiCall({ abi: 'address:token', calls: yvCurveTokens })).map(i => i.toLowerCase())
  const pricePerShare = await api.multiCall({ abi: 'uint256:pricePerShare', calls: yvCurveTokens })
  yvCurveTokens.forEach((t, i) => {
    const uToken = yvCurveUnderlyings[i]
    const pps = pricePerShare[i] / 1e18

    const balance = balancesTemp[t.toLowerCase()]
    delete balancesTemp[t.toLowerCase()]

    if (!balance) return;
    if (!balancesTemp[uToken]) balancesTemp[uToken] = 0
    balancesTemp[uToken] += balance * pps
  })

  // resolve curve lp tokens
  const allTokens = Object.keys(balancesTemp)
  const isCurveLPToken = await api.multiCall({ abi: 'uint256:get_virtual_price', calls: allTokens, permitFailure: true })
  const lpTokens = allTokens.filter((_, i) => isCurveLPToken[i])

  const lpTokenVersion = await api.multiCall({ abi: 'string:version', calls: lpTokens, permitFailure: true })

  const curveLP_pre_v7 = []
  const curveLP_v7 = []
  lpTokens.forEach((t, i) => {
    const version = lpTokenVersion[i]
    if (!version) return;
    const majorVersion = parseInt(version.slice(1).split(".")[0])
    if (majorVersion >= 7) {
      curveLP_v7.push(t)
    } else {
      curveLP_pre_v7.push(t)
    }
  })

  // unwrap pre v7 curve LP tokens
  const token0s = await api.multiCall({ abi: 'function coins(uint256) view returns (address)', calls: curveLP_pre_v7.map(i => ({ target: i, params: 0 })) })
  const token1s = await api.multiCall({ abi: 'function coins(uint256) view returns (address)', calls: curveLP_pre_v7.map(i => ({ target: i, params: 1 })) })
  const balancesT0 = await api.multiCall({ abi: 'erc20:balanceOf', calls: curveLP_pre_v7.map((v, idx) => ({ target: token0s[idx], params: v })) })
  const balancesT1 = await api.multiCall({ abi: 'erc20:balanceOf', calls: curveLP_pre_v7.map((v, idx) => ({ target: token1s[idx], params: v })) })
  const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: curveLP_pre_v7 })

  curveLP_pre_v7.forEach((lp, i) => {
    const supply = supplies[i]
    const bal0 = balancesT0[i]
    const bal1 = balancesT1[i]

    const token0 = token0s[i].toLowerCase()
    const token1 = token1s[i].toLowerCase()

    const lpBalance = balancesTemp[lp.toLowerCase()]
    delete balancesTemp[lp.toLowerCase()]

    if (!lpBalance) return;

    if (!balancesTemp[token0]) balancesTemp[token0] = 0
    if (!balancesTemp[token1]) balancesTemp[token1] = 0

    balancesTemp[token0] += (bal0 / supply) * lpBalance
    balancesTemp[token1] += (bal1 / supply) * lpBalance
  })

  // unwrap v7 curve LP tokens

  const lpCoins = await api.fetchList({ lengthAbi: 'N_COINS', itemAbi: 'coins', calls: curveLP_v7, groupedByInput: true, })
  const token0sv7 = lpCoins.map(i => i[0])
  const token1sv7 = lpCoins.map(i => i[1])
  const balancesT0v7 = await api.multiCall({ abi: 'erc20:balanceOf', calls: curveLP_v7.map((v, idx) => ({ target: token0sv7[idx], params: v })) })
  const balancesT1v7 = await api.multiCall({ abi: 'erc20:balanceOf', calls: curveLP_v7.map((v, idx) => ({ target: token1sv7[idx], params: v })) })
  const suppliesv7 = await api.multiCall({ abi: 'uint256:totalSupply', calls: curveLP_v7 })

  curveLP_v7.forEach((lp, i) => {
    const supply = suppliesv7[i]
    const bal0 = balancesT0v7[i]
    const bal1 = balancesT1v7[i]

    const token0 = token0sv7[i].toLowerCase()
    const token1 = token1sv7[i].toLowerCase()

    const lpBalance = balancesTemp[lp.toLowerCase()]
    delete balancesTemp[lp.toLowerCase()]

    if (!lpBalance) return;

    if (!balancesTemp[token0]) balancesTemp[token0] = 0
    if (!balancesTemp[token1]) balancesTemp[token1] = 0

    balancesTemp[token0] += (bal0 / supply) * lpBalance
    balancesTemp[token1] += (bal1 / supply) * lpBalance
  })

  Object.entries(balancesTemp).forEach(([k, v]) => api.add(k, v))

  api.removeTokenBalance('0x865377367054516e17014ccded1e7d814edc9ce4') // remove DOLA - ownToken
  api.removeTokenBalance('0xb45ad160634c528Cc3D2926d9807104FA3157305') // remove sDOLA - ownToken
}

module.exports = {
  methodology: "Get collateral balances from users personal escrows",
  hallmarks: [
    [1707177600, "Launch of sDOLA"],
    [1718236800, "CRV liquidation"]
  ],
  start: '2022-12-10', // Dec 10 2022
  ethereum: {
    tvl,
    staking: staking("0x1637e4e9941D55703a7A5E7807d6aDA3f7DCD61B", "0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68")
  }
};
