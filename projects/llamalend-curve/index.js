
const chainContracts = {
    ethereum: "0xeA6876DDE9e3467564acBeE1Ed5bac88783205E0",
    arbitrum: "0xcaec110c784c9df37240a8ce096d352a75922dea",
    fraxtal: "0xf3c9bdAB17B7016fBE3B77D17b1602A7db93ac66",
    optimism: "0x5ea8f3d674c70b020586933a0a5b250734798bef"
}

const uniq = (arr) => Array.from(new Set(arr))
module.exports=Object.keys(chainContracts).reduce((all, chain)=> ({
    ...all,
    [chain]:{
        tvl: async (_t, _b, _c, {api})=>{
            const markets = await api.fetchList({ lengthAbi: 'market_count', itemAbi: 'controllers', target: chainContracts[chain] })
            const amms = await api.multiCall({ abi: 'address:amm', calls: markets })
            const collat = await api.multiCall({ abi: 'address:collateral_token', calls: markets })
            const borrowTokens = await api.multiCall({ abi: 'address:borrowed_token', calls: markets })
            return api.sumTokens({ tokens: uniq(collat.concat(borrowTokens)), owners: uniq(amms.concat(markets)) })
        },
        borrowed: async (_t, _b, _c, {api})=>{
            const markets = await api.fetchList({ lengthAbi: 'market_count', itemAbi: 'controllers', target: chainContracts[chain] })
            const debt = await api.multiCall({ abi: 'uint:total_debt', calls: markets })
            const borrowTokens = await api.multiCall({ abi: 'address:borrowed_token', calls: markets })
            debt.forEach((d, i)=>{
                api.add(borrowTokens[i], d)
            })
            return api.getBalances()
        }
    }
}), {})