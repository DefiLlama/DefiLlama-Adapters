const axios = require('axios');

const tvl = async (api) => {
    const apiUrl = "https://api.jigsawdev.org/api/protocol/tvl";
    try {
        const {data} = await axios.get(apiUrl);
        const totalValueLocked = data ? parseFloat(data.totalValueLocked) : 0;
        api.addUSDValue(totalValueLocked)
    } catch (error) {
        console.error('Error fetching TVL:', error);
        api.addUSDValue(0);
    }
}

module.exports = {
    methodology: "Data is retrieved from the api at https://api.jigsaw.org",
    ethereum: {
        tvl: tvl
    }
};