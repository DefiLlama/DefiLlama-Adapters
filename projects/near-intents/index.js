const { httpGet } = require("../helper/chain/near")
const { call, sumSingleBalance } = require('../helper/chain/near')

function tvl() {
    return async () => {
        const api_tvl = "https://flipsidecrypto.xyz/api/v1/queries/82a54d67-5614-4b3c-b2fa-696396dc5c30/data/latest";
        const assetsCallResponse = await httpGet(api_tvl);
  
        const balances = {'NEAR': assetsCallResponse[0].TOTAL_NET_MINTED_VOLUME};
  
        return balances;
    }
  }


module.exports = {
    near: {
        tvl: tvl(),
    }
}