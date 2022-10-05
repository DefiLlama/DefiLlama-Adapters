const retry = require('async-retry');
const axios = require("axios");
const BN = require("bn.js");
const { PublicKey } = require("@solana/web3.js")
const { getConnection } = require("./helper/solana");

async function tvl() {
    const connection = getConnection();
    const metadataState = await connection.getAccountInfo(new PublicKey("DEg9mNnxwqJQiYz2mXpVJmq8Yyx14oZ2SaYpHS7mB2mx"));
    const posSolVirtualAmount = metadataState.data.slice(129, 137);
    posSolVirtualAmount.reverse();
    console.log(new BN(posSolVirtualAmount).toString());
    const liqSolAmount = metadataState.data.slice(307, 315);
    liqSolAmount.reverse();
    console.log(new BN(liqSolAmount).toString());
    const posState = await connection.getAccountInfo(new PublicKey("CaxYodGBcen2MVPSM1SKdAMHC2csnPSvLAZu2vkVT1H2"));
    const totalActiveBalance = posState.data.slice(160, 168);
    totalActiveBalance.reverse();
    console.log(new BN(totalActiveBalance).toString());
    const premiumPoolAccountBalance = new BN((await connection.getAccountInfo(new PublicKey("632JbevHriKtPvxncKJYa5asT76Rm77Tnrvncscufusg"))).lamports);
    console.log(premiumPoolAccountBalance.toString());
    const claimProgramSolBalance = new BN((await connection.getAccountInfo(new PublicKey("3eXy94aq5sGN3pZiJBzM6LVP4W7vNPoNbyPkpqSwBn8u"))).lamports);
    console.log(claimProgramSolBalance.toString());
    const pcuvSolBalance = new BN((await connection.getAccountInfo(new PublicKey("3snom88cEW4WtXH7pHEyYHr76oMVtYqAMdJ4BtBWWaC9"))).lamports);
    console.log(pcuvSolBalance.toString());

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
