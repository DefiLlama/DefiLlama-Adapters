const { default: axios } = require('axios');
async function fetch(){

    const allInfo =  (await axios.get('https://api.meowswap.fi/?method=Exchange.GetAllInfo', {data: {"id":1,"method":"Exchange.GetAllInfo","jsonrpc":"2.0","params":{}}})).data.result

    let allToken = allInfo.pools
    let adaUsd = allInfo.ADA_USD;

    const Pairs = (await axios.post('https://api.meowswap.fi/?method=Info.Pairs', {"jsonrpc": "2.0","method": "Info.Pairs","id": 3,"params": {}})).data.result.data

    let totalLiquid = 0;
    await Pairs.forEach((row) => {
        let rowSt = { ...row };
        if (rowSt.token1 === 'ADA') {
            const FindPair = allToken.find((obj) => {
                return obj.firstAsset.assetId === rowSt.token2;
            });
            rowSt.token1_lock_summ_in_usd = adaUsd * rowSt?.pair_sum_q1;
            rowSt.token2_lock_summ_in_usd = adaUsd * rowSt?.pair_sum_q2 * FindPair?.exchange ?? 0;

        } else {
            const FindPair = allToken.find((obj) => {
                return obj.firstAsset.assetId === rowSt.token1;
            });
            rowSt.token2_lock_summ_in_usd = adaUsd * rowSt?.pair_sum_q2;
            rowSt.token1_lock_summ_in_usd = adaUsd * rowSt?.pair_sum_q1 * FindPair?.exchange ?? 0;
        }
        rowSt.tvl_valid = rowSt.token1_lock_summ_in_usd + rowSt.token2_lock_summ_in_usd;
        totalLiquid += rowSt.tvl_valid;
    });
    return totalLiquid;
}

module.exports = {
    methodology: "Data is retrieved from the api at https://api.meowswap.fi/",
    timetravel: false,
    fetch
}
