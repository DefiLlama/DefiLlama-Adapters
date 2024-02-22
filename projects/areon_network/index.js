const axios = require("axios");

const URL = 'https://mainservices.areon.network';

const TOTAL = '/mainnet-supplies?q=totalcoins';
const CIRC_SUPPLY = '/mainnet-supplies?q=circulating';

async function getTvl() {

    try {
        let currentPrice = (await axios.get(`${URL}/get-price`)).data;
        if (currentPrice.success = false) return;
        currentPrice = currentPrice.result;

        const totalSupply = (await axios.get(URL + TOTAL)).data;
        if (!totalSupply) return;

        const circulatingSupply = (await axios.get(URL + CIRC_SUPPLY)).data;
        if (!circulatingSupply) return;

        return (totalSupply - circulatingSupply) * currentPrice;
    } catch (e) {
        return 0;
    }

}

module.exports = {
    fetch: getTvl
}