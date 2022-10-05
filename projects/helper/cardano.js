const axios = require("axios");

async function getAdaInAddress(address) {
    return axios.post("https://api.koios.rest/api/v0/address_info", {
        "_addresses": [
            address
        ]
    }).then(r=>r.data[0].balance / 1e6)
}

module.exports={
    getAdaInAddress
}