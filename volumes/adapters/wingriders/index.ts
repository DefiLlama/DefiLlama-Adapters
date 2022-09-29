import axios from "axios"
import BigNumber from "bignumber.js";
import { VolumeAdapter } from "../../dexVolume.type"
import { CHAIN } from "../../helper/chains";

const volUrl = 'https://aggregator.mainnet.wingriders.com/volumeInAda';

async function fetchVolume() {
    const last24hVolInAda = await axios.post(volUrl, { "lastNHours": 24 });
    const totalVolumeInAda = await axios.post(volUrl);

    const prices = await axios.post('https://coins.llama.fi/prices', {
        "coins": [
            "coingecko:cardano",
        ],
    });

    const adaPrice = prices.data.coins["coingecko:cardano"].price;

    const dailyVolume = (new BigNumber(last24hVolInAda.data).multipliedBy(adaPrice)).toString();
    const totalVolume = (new BigNumber(totalVolumeInAda.data).multipliedBy(adaPrice)).toString();

    return {
        dailyVolume,
        totalVolume,
        timestamp: Date.now() / 1e3
    }
}

export default {
    volume: {
        [CHAIN.CARDADO]: {
            fetch: fetchVolume,
            runAtCurrTime: true,
            start: async () => 0,
        }
    }
} as VolumeAdapter
