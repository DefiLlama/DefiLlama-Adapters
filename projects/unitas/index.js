const {getTokenSupplies} = require('../helper/solana');

const SOLANA_TOKEN_ADDRESS = '9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy';
const BSC_TOKEN_ADDRESS = "0xeA953eA6634d55dAC6697C436B1e81A679Db5882"

async function solanaTvl() {
    const supply = await getTokenSupplies([SOLANA_TOKEN_ADDRESS]);
    return {
        'usd-coin': supply[SOLANA_TOKEN_ADDRESS] / 1e6
    }
}

async function bscTvl(api) {
    const supply = await api.call({abi: 'erc20:totalSupply', target: BSC_TOKEN_ADDRESS})
    return {
        'usd-coin': supply / 1e18
    }
}

module.exports = {
    hallmarks: [
        [1747670400, "solana unitas launch"]
    ],
    timetravel: false,
    methodology: "Currently, tvl is composed of minted USDu",
    solana: {
        tvl: solanaTvl
    },
    bsc: {
        tvl: bscTvl
    }
}