const { default: axios } = require("axios")

async function fetch(){
    const matterDeposited = (await axios.get("https://test-nftapi.antimatter.finance/app/getMatterDao")).data
    const totalInvest = (await axios.get("https://dualinvest-api.antimatter.finance/web/getDashboard")).data

    return matterDeposited.Total_Value_Locked + totalInvest.totalInvestAmount
}

module.exports={
    methodology: "Data is retrieved from the api at https://dex-api.adax.pro/",
    timetravel: true,
    fetch
}