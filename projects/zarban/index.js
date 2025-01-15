const abi = require("./abi.json")

//constant addresses
const lendingPoolAddress = "0xC62545B7f466317b014773D1C605cA0D0931B0Fd";
const ilkRegistryAddress = "0x821282748eb5b63155df21c62d6a6699ffcb01cf";
const vat = "0x975Eb113D580c44aa5676370E2CdF8f56bf3F99F";
const zar = "0xd946188a614a0d9d0685a60f541bba1e8cc421ae";

async function getMarketForToken(api, tokenAddress) {
  const marketAddress = (await api.call({
    target: lendingPoolAddress,
    abi: abi.lendingPool.getReserveData,
    params: [tokenAddress],
  })).zTokenAddress
  return [marketAddress, tokenAddress]
}

async function getLmMarkets(api) {
  const lmMarkets = []

  // Get the list of reserves (markets) in the LendingPool
  const tokens = (
    await api.call({
      target: lendingPoolAddress,
      abi: abi.lendingPool.getReservesList,
    })
  );

  for (const tokenAddress of tokens) {
    lmMarkets.push(await getMarketForToken(api, tokenAddress))
  }
  return await Promise.all(lmMarkets)
}

async function getGemForIlk(api, ilk) {
  const gemJoin = await api.call({
    target: ilkRegistryAddress,
    abi: abi.ilkRegistry.join,
    params: [ilk],
  })
  const gem = await api.call({
    target: gemJoin,
    abi: abi.gemJoin.gem,
  })
  return [gemJoin, gem]
}

async function getScsMarkets(api) {
  const scsMarkets = []

  const ilks = (
    await api.call({
      target: ilkRegistryAddress,
      abi: abi.ilkRegistry.list,
    })
  );

  for (const ilk of ilks) {
    scsMarkets.push(await getGemForIlk(api, ilk))
  }

  return await Promise.all(scsMarkets)
}

async function tvl(api) {
  const [lmMarkets, scsMarkets] = await Promise.all([
    getLmMarkets(api),
    getScsMarkets(api)]
  )

  let balances = []
  for (const [marketAddress, tokenAddress] of lmMarkets) {
    balances.push(api.call({
      target: marketAddress,
      abi: 'erc20:totalSupply',
    }))
  }
  for (const [gemJoin, gem] of scsMarkets) {
    balances.push(api.call({
      target: gem,
      abi: 'erc20:balanceOf',
      params: [gemJoin],
    }))
  }

  balances = await Promise.all(balances)
  const markets = lmMarkets.concat(scsMarkets)
  for (const i in balances) {
    api.add(markets[i][1], balances[i])
  }

}

async function borrowed(api) {

  const [lmMarkets, scsMarkets] = await Promise.all([
    getLmMarkets(api),
    getScsMarkets(api)]
  )
  for (const [marketAddress, tokenAddress] of lmMarkets) {

    const reserveData = await api.call({
      target: lendingPoolAddress,
      abi: abi.lendingPool.getReserveData,
      params: [tokenAddress],
    })

    const vDebtToken = reserveData.variableDebtTokenAddress
    const sDebtToken = reserveData.stableDebtTokenAddress
    const vDebt = await api.call({
      target: vDebtToken,
      abi: 'erc20:totalSupply',
    })
    const sDebt = await api.call({
      target: sDebtToken,
      abi: 'erc20:totalSupply',
    })
    api.add(tokenAddress, vDebt)
    api.add(tokenAddress, sDebt)
  }

  const debt = await api.call({
    target: vat,
    abi: abi.vat.debt,
  })

  const borrowedWithInterest = debt / 1e27
  api.add(zar, borrowedWithInterest)
}

module.exports = {
  start: 77669795,
  arbitrum: {
    tvl,
    borrowed,
  }
}