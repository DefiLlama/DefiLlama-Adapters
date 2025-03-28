const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require('../helper/utils');



async function tvl(api) {
    const response = await fetchURL("https://amp81f4tgd.execute-api.eu-north-1.amazonaws.com/api/tvl/146") 
    api.add(ADDRESSES.null, response.data.totalTvl)
}



module.exports = {
  timetravel: false,
  sonic: {
    tvl
  }
}
