const abi = require('../helper/abis/aave.json');

async function ammMarket(api, borrowed) {
  const lendingPool = "0x7937D4799803FbBe595ed57278Bc4cA21f3bFfCB"
  const reservesList = (await api.call({
    target: lendingPool,
    abi: abi.getReservesList,
  }))
  const reservesData = await api.multiCall({
    abi: abi.getAMMReserveData,
    target: lendingPool,
    calls: reservesList,
  })
  const [balanceOfTokens, symbols] = await Promise.all([
    api.multiCall({
      abi: "erc20:balanceOf",
      calls: reservesData.map((r, idx) => ({ target: reservesList[idx], params: r.aTokenAddress })),
    }),
    api.multiCall({ abi: "erc20:symbol", calls: reservesList, }),
  ]);

  if (borrowed) {
    const [supplyStabledebt, supplyVariableDebt] = await Promise.all(["stableDebtTokenAddress", "variableDebtTokenAddress"].map(prop =>
      api.multiCall({
        abi: "erc20:totalSupply",
        calls: reservesData.map((r, idx) => r[prop]),
      })
    ));
    supplyStabledebt.map((ssd, i) => {
      balanceOfTokens[i] = Number(BigInt(ssd) + BigInt(supplyVariableDebt[i]))
    })
  }

  api.addTokens(reservesList, balanceOfTokens)
}

module.exports = {
  ammMarket
}