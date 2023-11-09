const sdk = require('@defillama/sdk');
const axios = require('axios');


//Full Calculations for computing TVL for Resonate Finance is done internally by Resonate and exposed via API
//API Endpoint: https://api.resonate.finance/{chainId}/tvl
//https://github.com/Revest-Finance/railway-monorepo/blob/main/src/api.ts",
async function tvl(_, _1, _2, { api }) {
  let usdValue = 0;
  do {
      const {data, success} = await axios.get(`https://api.resonate.finance/${api.chainId}/tvl`);
      usdValue = data;
  } while (usdValue == 0)
  
  return { 
    tether: usdValue,
  };
}

module.exports = {
    methodology: "We sum all the tokens deposited as principal and any unclaimed interest accrued on it.",
    hallmarks: [
      [1682438400, "Launch of Regen Portal"],
      [1687276800, "Launch of Frax Portal"]
    ],
    ethereum: {
      tvl
    },
    polygon: {
        tvl
    },
    optimism: {
      tvl
    },
    arbitrum: {
      tvl
    },
    fantom: {
      tvl
    },
  };
