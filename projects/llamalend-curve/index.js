
const uniq = (arr) => Array.from(new Set(arr))
module.exports={
    ethereum:{
        tvl: async (_t, _b, _c, {api})=>{
            const markets = await api.fetchList({ lengthAbi: 'market_count', itemAbi: 'controllers', target: "0xeA6876DDE9e3467564acBeE1Ed5bac88783205E0" })
            const amms = await api.multiCall({ abi: 'address:amm', calls: markets })
            const collat = await api.multiCall({ abi: 'address:collateral_token', calls: markets })
            const borrowTokens = await api.multiCall({ abi: 'address:borrowed_token', calls: markets })
            return api.sumTokens({ tokens: uniq(collat.concat(borrowTokens)), owners: uniq(amms.concat(markets)) })
        },
        borrowed: async (_t, _b, _c, {api})=>{
            const markets = await api.fetchList({ lengthAbi: 'market_count', itemAbi: 'controllers', target: "0xeA6876DDE9e3467564acBeE1Ed5bac88783205E0" })
            const debt = await api.multiCall({ abi: 'uint:total_debt', calls: markets })
            const borrowTokens = await api.multiCall({ abi: 'address:borrowed_token', calls: markets })
            debt.forEach((d, i)=>{
                api.add(borrowTokens[i], d)
            })
            return api.getBalances()
        }
    }
}