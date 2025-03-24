const axios = require("axios")

async function suiTVL() {
    const resp = await axios.get(`https://haedal.xyz/api/v3/sui/vaults/pools?category=haedal&order_by=tvl&id=&coin_type=`)
    const suiAmount = resp?.data?.data?.list.reduce((acc, curr) => acc + Number(curr.tvl), 0)

    return {
        sui: suiAmount,
    }
}

module.exports = {
    sui: {
        tvl: suiTVL,
    }
}