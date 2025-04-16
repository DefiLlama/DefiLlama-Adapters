const { httpGet } = require("../helper/chain/near")

const api_tvl = "https://flipsidecrypto.xyz/api/v1/queries/82a54d67-5614-4b3c-b2fa-696396dc5c30/data/latest"


function tvl() {
    return async () => {
      const assetsCallResponse = await httpGet(api_tvl);
  
      const balances = assetsCallResponse?.TOTAL_NET_MINTED_VOLUME || '0';
  
      return balances;
    }
  }


module.exports = {
    near: {
        tvl: tvl()
    }
}