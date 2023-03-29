const { default: axios } = require('axios');
async function fetch(){

    const response = await axios.get('https://api.bubbleswap.io/analytics/api/v1/analytics/aggregate/liquidity/year', {
        headers: {
            //I would prefer the user agengt to be set to something like axios, or DefiLlama, but our WAF only allows the bellow
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        }
    });

    if(!response?.data?.ok 
        || !response?.data?.data 
        || !Array.isArray(response?.data?.data) 
        || !response?.data?.data?.length > 0) {

        return null;

    }

    const lastItem = response.data.data[response.data.data.length - 1];
    
    if(isNaN(lastItem[1])){
        return null;
    }

    return Number(lastItem[1]);

}

module.exports = {
    methodology: "Data is retrieved from the api at https://analytics.bubbleswap.io/",
    timetravel: false,
    fetch
}