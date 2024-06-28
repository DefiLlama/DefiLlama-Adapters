const {tvl} = require('../helper/kayakPoolTvl'); // 确保路径正确

const PoolAddress = {
    avax_savax: "0x9173398180C86eB4A313F4e6EcdE24aDCaD9df34",
    usdt_usdc: "0x385a1b97b5f887B3987992ad959698915D5519E4",
};

async function displayTVL() {
    try {
         const tvl1 = await tvl();
        console.log("tvl1:",tvl1)
        return tvl1;
    } catch (error) {
        console.error('Error fetching TVL:', error);
    }
}

module.exports = {
    methodology: "Summary of the value of most locked assets denominated in USD. These assets are counted based on the number of tokens on the chain. For more details, please visit our official website: https://kayakfinance.io/.",
    avax: {
        tvl: displayTVL
    }
};