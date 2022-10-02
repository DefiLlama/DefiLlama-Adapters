import axios from 'axios';
import { CHAIN } from '../../helper/chains';

const endpoint = "https://api.mainnet.orca.so/v1/standard-pool/list";
const wpEndpoint = "https://api.mainnet.orca.so/v1/whirlpool/list?whitelisted=true";

async function fetch() {
    const [pools, whirlpools] = await Promise.all([axios.get(endpoint), axios.get(wpEndpoint)]);
    const poolsVol = Object.keys(pools.data).map((index) => {
        return {
            volume_24h: Number(pools.data[index].volume.day)
        }
    }).reduce((sum:number, pool:any) =>
        sum + pool.volume_24h
    , 0);

    const wpVol = whirlpools.data.whirlpools.reduce((sum:number, pool:any) =>
        sum + pool.volume.day
    , 0);
    return {
        dailyVolume:  wpVol + poolsVol,
        timestamp: Date.now()/1e3
    }
}

export default {
    volume:{
        [CHAIN.SOLANA]: {
            fetch: fetch,
            runAtCurrTime: true,
            start: async ()=>0,
        }
    }
}
