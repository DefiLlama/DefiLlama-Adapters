const { default: axios } = require('axios');

async function fetch(){

    const response = await axios.get(' https://api.testnet.bubbleswap.io/v2/backend/api/v1/tvl', {
        headers: {
            //I would prefer the user agengt to be set to something like axios, or DefiLlama, but our WAF only allows the bellow
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        }
    });

    if(!response.ok || response?.data?.sumTVL === undefined) {

        return null;

    }

    return Number(response?.data?.sumTVL) || 0;

}

module.exports = {
  fetch,
  timetravel: false,
  methodology: "Data is retrieved from the api at https://api.testnet.bubbleswap.io/",
  hallmarks: [
    [1676644131, "V2 Launch"],
  ]
}