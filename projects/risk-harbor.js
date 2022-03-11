const sdk = require('@defillama/sdk')
const axios = require('axios');

const RISK_HARBOR_ADDRESS = "terra1dlfz2teqt5shxuw87npfecjtv7xlrxvqd4sapt";
const CHAIN = "terra";
const RPC = process.env.TERRA_RPC || "https://terra.stakesystems.io";

function createQuery(block, paginationKey){
    return axios(`${RPC}/cosmos/bank/v1beta1/balances/${RISK_HARBOR_ADDRESS}`, {
        params: {
            paginationKey,
            height: block - (block % 100)
        }
    }).then(res=>res.data);
}

async function recursiveQuery(timestamp, block, content=[]) {
    const result = await createQuery(block, timestamp)
    const pageKey = result.pagination.next_key
    content = content.concat(result.balances)
    if(pageKey){
        return recursiveQuery(pageKey, block, content)
    }
    return content
}

function computeTVL(content){
    const totalAmmount = {
        terrausd: 0,
    };
    content.forEach(data=>{
        const {denom, amount} = data;
        const qty = parseInt(amount) / 1e6;
        if(denom === "uusd"){
            totalAmmount.terrausd += qty;
        }
    })
    return totalAmmount;
}

async function getTvl(timestamp) {
  const { block } = sdk.api.util.lookupBlock(timestamp, { CHAIN });
  const content = await recursiveQuery(timestamp, block);
  return computeTVL(content);
}

module.exports = {
  timetravel: true,
  methodology: "Total terrausd inside the Risk Harbor contract",
  start: 5877550,
  misrepresentedTokens: false,
  tvl: getTvl,
};