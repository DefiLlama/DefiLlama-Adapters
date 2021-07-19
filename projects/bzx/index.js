const axios = require("axios")
const sdk = require('@defillama/sdk');

const endpoint = "https://api.bzx.network/v1/vault-balance-usd?networks=bsc,eth,polygon"

async function tvl() {
    const tvlRespons = await axios.get(endpoint)
    const eth = Number(tvlRespons.data['data']['eth']['all']);
    const bsc = Number(tvlRespons.data['data']['bsc']['all']);
    const polygon = Number(tvlRespons.data['data']['polygon']['all']);
    res = {
        ethereum: {
            tvl: eth
        },
        bsc: {
            tvl: bsc
        },
        polygon: {
            tvl: polygon
        },

        tvl:  eth + bsc + polygon
    }
    return res;
}

module.exports = {
    tvl 
};
