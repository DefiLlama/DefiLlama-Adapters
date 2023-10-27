const axios = require('axios');

const ONE_DAY = 86400;     // 86400000s = 1 day

function getDotTVL(_dotTvlData, timestamp) {
    // convert day_timestamp to unix timestamp in seconds
    const dotTvlData = _dotTvlData.map(d => ({
        ...d,
        day_timestamp: new Date(d.day_timestamp).getTime() / 1000,
    }))

    const firstDate = dotTvlData[0].day_timestamp
    if (timestamp < firstDate - ONE_DAY) {
        throw new Error(`Timestamp is more than 1 day earlier than the first date in the data. Timestamp: ${timestamp}, First date: ${firstDate}`);
    }

    let smallestDiff = Infinity;
    let targetDotTVL = null;
    dotTvlData.forEach(entry => {
        const entryDate = entry.day_timestamp
        const diff = Math.abs(entryDate - timestamp);

        if (diff < smallestDiff) {
            smallestDiff = diff;
            targetDotTVL = entry.dot_tvl;
        }
    });

    return targetDotTVL;
}

async function tvl(timestamp, _1, _2, { api }) {
    const response = await axios.get('https://api.dune.com/api/v1/query/3132389/results?api_key=ItzgVHuqp1idtYFmDAzo15kEDILs1qXb');
    const dotTvlData = response.data?.result?.rows
    console.log(response.data?.result)

    const dotTvl = getDotTVL(dotTvlData, timestamp)
    if (!dotTvl) {
        throw new Error('Failed to fetch Ehphrates DOT TVL!');
    }

    return {
        polkadot: dotTvl
    }
}

module.exports = {
    timetravel: true,
    start: 1695657600,
    methodology: 'total dot/lcdot staked - total dot/lcdot unstaked',
    acala: {
        tvl,
    }
}