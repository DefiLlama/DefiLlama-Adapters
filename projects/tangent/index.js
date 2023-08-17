const { default: axios } = require('axios');
async function fetch() {
    return (await axios.get('https://api.tangent.bar/api/v1/MainStatistics')).data.allTVL
}

module.exports = {
    methodology: "Data is retrieved from the api at https://api.tangent.bar/",
    timetravel: false,
    fetch: () => 0
}
