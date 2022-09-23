import axios from 'axios';

const endpoint = "https://api.orca.so/pools";
const wpEndpoint = "https://mainnet-zp2-v2.orca.so/pools";

async function fetch() {
    const [pools, whirlpools] = await Promise.all([axios.get(endpoint), axios.get(wpEndpoint)]);
    const poolsVol = pools.data.reduce((sum:number, pool:any) =>
        sum + pool.volume_24h
    , 0);
    const wpVol = whirlpools.data.reduce((sum:number, pool:any) =>
        sum + pool.volume.day
    , 0);
    return {
        dailyVolume: poolsVol + wpVol,
        timestamp: Date.now()/1e3
    }
}

export default {
    volume:{
        "solana": {
            fetch: fetch,
            runAtCurrTime: true,
            start: async ()=>0,
        }
    }
}