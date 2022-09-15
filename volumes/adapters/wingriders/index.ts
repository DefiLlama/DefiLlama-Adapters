import axios from "axios"

async function last24h(){
    const data = await axios.post('https://aggregator.mainnet.wingriders.com/poolsWithMarketdata', {"limit":500})
    const prices = await axios.post('https://coins.llama.fi/prices', {
        "coins": [
            "coingecko:cardano",
        ],
    })
    const vol = data.data.reduce((s:number, c:any)=>s+Number(c.marketData.volumeA24h)+Number(c.marketData.outputVolumeA24h), 0)/1e6
        * prices.data.coins["coingecko:cardano"].price
    return {
        dailyVolume: vol,
        timestamp: Date.now()/1e3
    }
}

export default {
    volume:{
        "cardano": {
            fetch: last24h,
            runAtCurrTime: true,
            start: async ()=>0,
        }
    }
}