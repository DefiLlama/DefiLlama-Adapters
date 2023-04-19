const sdk = require('@defillama/sdk')
const abi = require('./abi.json')


const chain = 'era'

const contractAddress = {
    bankHall: '0xA4357F550e034B0f899463A56B346BF38967a194',
    pool: '0x60E2B7e4893cf40a11ec4Df1B8aD22deBab20218'
}


async function tvl(_, _b, { [chain]: block}) {
    const { output: bankLen } = await sdk.api.abi.call({
        abi: abi.boxesLength,
        target: contractAddress.bankHall,
        chain, block
    })
    const { output: poolAddressList } = await sdk.api.abi.multiCall({
        abi: abi.boxInfo,
        calls: Array(parseInt(bankLen)).fill(0).map((item, i) => ({ target: contractAddress.bankHall, params: [i] })),
        chain, block,
    })
    const { output: tokenList } = await sdk.api.abi.multiCall({
        abi: abi.baseToken,
        calls: poolAddressList.map(item=> ({ target: item.output })),
        chain, block,
    })
    const { output: depositTotalList } = await sdk.api.abi.multiCall({
        abi: abi.getDepositTotal,
        calls: poolAddressList.map(item=> ({ target: item.output })),
        chain, block
    })

    const { output: borrowTotalList } = await sdk.api.abi.multiCall({
        abi: abi.getBorrowTotal,
        calls: poolAddressList.map(item=> ({ target: item.output })),
        chain, block
    })

    
    const balances = {}
    for (let i = 0; i < depositTotalList.length; i++) {
        const token = tokenList[i].output
        const depositTotal = depositTotalList[i].output
        const borrowTotal = borrowTotalList[i].output
        await sdk.util.sumSingleBalance(balances, token, depositTotal, chain)
        await sdk.util.sumSingleBalance(balances, token, borrowTotal, chain)
    }
    const { output: poolLen } = await sdk.api.abi.multiCall({
        abi: abi.poolLength,
        calls: [{ target: contractAddress.pool }],
        chain, block,
    })
    
    const { output: fpoolAllInfoList } = await sdk.api.abi.multiCall({
        abi: abi.poolInfo,
        calls: Array(parseInt(poolLen[0].output)).fill(0).map((item, i) => ({ target: contractAddress.pool, params: [i] })),
        chain, block,
    })
    const { output: tokenSymbolList } = await sdk.api.abi.multiCall({
        abi: 'erc20:symbol',
        calls: fpoolAllInfoList.map(item=>({ target: item.output.lpToken })),
        chain, block,
    })
    const fPoolIndex = []
    for(let i=0;i<tokenSymbolList.length;i++) {
        const symbol = tokenSymbolList[i].output
        if (symbol.startsWith('f')) {
            fPoolIndex.push(i)
        }
    }
   const { output: poolTokenList } = await sdk.api.abi.multiCall({
        abi: abi.baseToken,
        calls: fPoolIndex.map(item=>({ target: fpoolAllInfoList[item].output.lpToken })),
        chain, block,
   })
   const { output: coefficientList } = await  sdk.api.abi.multiCall({
        abi: abi.getBaseTokenPerLPToken,
        calls: fPoolIndex.map(item=>({ target: fpoolAllInfoList[item].output.lpToken })),
        chain, block,
    })

    for(let i=0;i<fPoolIndex.length;i++) {
        const totalAmount = fpoolAllInfoList[fPoolIndex[i]].output.totalAmount
        const coefficient = coefficientList[i].output
        const token = poolTokenList[i].output
        await sdk.util.sumSingleBalance(balances, token, (totalAmount * coefficient)/1e18, chain)
    }
    
    return balances
}




module.exports = {
    methodology: "Data is retrieved from the api at https://zkfox.io",
    era: {
        tvl
    }
}

