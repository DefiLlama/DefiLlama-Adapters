const retry = require('async-retry')
const axios = require("axios");

async function tvl() {
    var response = await retry(async bail => await axios.post('https://gql.amulet.org/tvl?code=POhj0JlawECAf6r7TANSZdXWelMSL1L4cbZZjCS9CzJkAzFurBl76A==', {
            query: `
                query {
                    tvl(input:{
                        first: 1
                    })
                    {
                        tvl_sol_amount
                    }
                }
            `
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    )

    return {
        'solana': Number(response.data.data.tvl.tvl_sol_amount)
    }
}

module.exports = {
    timetravel: false,
    solana:{
        tvl
    },
    methodology: `Amulet enables users to earn PoS staking rewards on Solana by staking SOL and mint amtSOL. amtSOL can be stake back to mint aUWT which will be used to underwrite covers. Hence, only the amount of SOL staked are counted as our TVL which the value are calculated based on the price get from Coingecko.`
}

tvl()