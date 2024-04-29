const ADDRESSES = require('../helper/coreAssets.json')
const {get} = require('../helper/http');
const BN = require("bn.js");


module.exports = {
    filecoin: {
        tvl: async (_, _1, _2, {api}) => {

            const {data: {allMinerValue, poolStFilBalance}} = await get("https://api.stfil.io/v1/info");
            const allMinerValueBN = new BN(allMinerValue);
            const poolStFilBalanceBN = new BN(poolStFilBalance);

            return api.add(ADDRESSES.null, allMinerValueBN.add(poolStFilBalanceBN));
        }
    }
}

