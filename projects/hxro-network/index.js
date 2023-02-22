const sdk = require('@defillama/sdk');
const { get } = require('../helper/http')

const MINT_TOKEN_CONTRACT = '0x4bD70556ae3F8a6eC6C4080A0C327B24325438f3'
const endpoint = "https://api.hxro.com/stats";

async function tvl(_, _1, _2, { api }) {
    const [stats] = await Promise.all([get(endpoint)]);

    let balances = { }

    await sdk.util.sumSingleBalance(balances, MINT_TOKEN_CONTRACT, stats['total_hxro_staked'] * Math.pow(10, 18))

  return balances;

}

module.exports = {
    timetravel: false,
    solana: {tvl, },
    hallmarks:[
        [1667865600, "FTX collapse"]
    ]
};
