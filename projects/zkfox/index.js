const abi = require('./abi.json')

const contractAddress = {
  bankHall: '0xA4357F550e034B0f899463A56B346BF38967a194',
  pool: '0x60E2B7e4893cf40a11ec4Df1B8aD22deBab20218'
}

const { compoundExports } = require('../helper/compound')


async function tvl(_, _b, _1, { api }) {
  const poolAddressList = await api.fetchList({ lengthAbi: abi.boxesLength, itemAbi: abi.boxInfo, target: contractAddress.bankHall })
  const tokenList = await api.multiCall({ abi: abi.baseToken, calls: poolAddressList, })
  const depositTotalList = await api.multiCall({ abi: abi.getDepositTotal, calls: poolAddressList, })
  const borrowTotalList = await api.multiCall({ abi: abi.getBorrowTotal, calls: poolAddressList, })

  for (let i = 0; i < depositTotalList.length; i++) {
    const token = tokenList[i]
    const depositTotal = depositTotalList[i]
    const borrowTotal = borrowTotalList[i]
    api.add(token, depositTotal)
    // api.add(token, borrowTotal) // we do not consider borrowed tokens as tvl
  }

  const fpoolAllInfoList = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: contractAddress.pool })
  const tokenSymbolList = await api.multiCall({ abi: 'erc20:symbol', calls: fpoolAllInfoList.map(item => item.lpToken), })
  const fPoolIndex = []
  for (let i = 0; i < tokenSymbolList.length; i++) {
    const symbol = tokenSymbolList[i]
    if (symbol.startsWith('f')) {
      fPoolIndex.push(i)
    }
  }
  const poolTokenList = await api.multiCall({
    abi: abi.baseToken,
    calls: fPoolIndex.map(item => ({ target: fpoolAllInfoList[item].lpToken })),
  })
  const coefficientList = await api.multiCall({
    abi: abi.getBaseTokenPerLPToken,
    calls: fPoolIndex.map(item => ({ target: fpoolAllInfoList[item].lpToken })),
  })

  for (let i = 0; i < fPoolIndex.length; i++) {
    const totalAmount = fpoolAllInfoList[fPoolIndex[i]].totalAmount
    const coefficient = coefficientList[i]
    const token = poolTokenList[i]
    api.add(token, (totalAmount * coefficient) / 1e18)
  }
}

module.exports = {
  era: {
    tvl
  }
}


module.exports = {
  era: compoundExports("0xc3D157Ee5D602E9CEAF6eA4c15C9b52B313A1364"),
}
