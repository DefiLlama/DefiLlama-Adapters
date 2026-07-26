const {getTokenSupplies} = require('../helper/solana');

const SOLANA_TOKEN_ADDRESS = '9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy';
const BSC_TOKEN_ADDRESS = "0xeA953eA6634d55dAC6697C436B1e81A679Db5882"
const XGLD_TOKEN_ADDRESS = {
    bsc: "0xe60106a5cAb7e7C64830919d36Ab20CaAf50Ac91",
    base: "0xeA953eA6634d55dAC6697C436B1e81A679Db5882",
    ethereum: "0x77a31A47E8a1dCe18Cb1772ae1C2157Fa080CFde",
}

async function solanaTvl() {
    const supply = await getTokenSupplies([SOLANA_TOKEN_ADDRESS]);
    return {
        'usd-coin': supply[SOLANA_TOKEN_ADDRESS] / 1e6
    }
}

async function bscTvl(api) {
    const [usduSupply, xgldSupply] = await Promise.all([
        api.call({abi: 'erc20:totalSupply', target: BSC_TOKEN_ADDRESS}),
        api.call({abi: 'erc20:totalSupply', target: XGLD_TOKEN_ADDRESS.bsc}),
    ])

    api.addCGToken('usd-coin', usduSupply / 1e18)
    api.add(XGLD_TOKEN_ADDRESS.bsc, xgldSupply)
}

async function xgldTvl(api) {
    const supply = await api.call({abi: 'erc20:totalSupply', target: XGLD_TOKEN_ADDRESS[api.chain]})

    api.add(XGLD_TOKEN_ADDRESS[api.chain], supply)
}

module.exports = {
    hallmarks: [
        ['2025-05-19', "solana unitas launch"]
    ],
    timetravel: false,
    methodology: "TVL is composed of minted USDu and xGLD supply.",
    solana: {
        tvl: solanaTvl
    },
    bsc: {
        tvl: bscTvl
    },
    base: {
        tvl: xgldTvl
    },
    ethereum: {
        tvl: xgldTvl
    }
}
