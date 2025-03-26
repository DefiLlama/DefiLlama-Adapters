const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require('../helper/utils');



async function fetchTvl(api) {
    const response = await fetchURL("https://amp81f4tgd.execute-api.eu-north-1.amazonaws.com/api/tvl/146") 
    const totalTvlConverted = parseFloat(response.data.totalTvl) / Math.pow(10, 18);

    api.add(ADDRESSES.sonic.wS, totalTvlConverted)
}



module.exports = {
  timetravel: false,
  sonic: {
    tvl: fetchTvl
  }
}