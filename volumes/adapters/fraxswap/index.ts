import axios from "axios"

function last24h(chain:string){
    return async()=>{
        const data = await axios.get('https://api.frax.finance/v2/fraxswap/pools')
        const vol = data.data.pools.filter((p:any)=>p.chain === chain).reduce(
            (a: number, b: any) =>
                a + b.volumeSwap24H
            , 0)
        return {
            dailyVolume: vol,
            timestamp: Date.now()/1e3
        }
    }
}

export default {
    volume:
        ["ethereum", "arbitrum", "avax", "bsc", "fantom", "moonbeam", "polygon", "moonriver"].reduce((all, chain)=>({
            ...all,
            [chain]: {
                fetch: last24h(chain === "avax"?"avalanche":chain),
                runAtCurrTime: true,
                start: async ()=>0,
            }
        }), {}),   
}