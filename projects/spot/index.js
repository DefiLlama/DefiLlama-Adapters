module.exports={
    ethereum:{
        tvl: async (_t, _b, _c, {api})=>{
            const tranches = await api.fetchList({ lengthAbi: 'deployedCount', itemAbi: 'deployedAt', target: "0x82a91a0d599a45d8e9af781d67f695d7c72869bd" })
            const bonds = await api.multiCall({ abi: 'address:bond', calls: tranches })
            return api.sumTokens({ tokens: ["0xd46ba6d942050d489dbd938a2c909a5d5039a161"], owners: [...bonds, "0x82A91a0D599A45d8E9Af781D67f695d7C72869Bd"] })
        }
    }
}