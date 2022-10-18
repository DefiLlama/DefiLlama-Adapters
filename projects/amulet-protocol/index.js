const BN = require("bn.js");
const { PublicKey } = require("@solana/web3.js")
const { getConnection } = require("../helper/solana");

async function tvl() {
    const connection = getConnection();
    const metadataState = await connection.getAccountInfo(new PublicKey("DEg9mNnxwqJQiYz2mXpVJmq8Yyx14oZ2SaYpHS7mB2mx"));
    const posSolVirtualAmount = metadataState.data.slice(129, 137);
    posSolVirtualAmount.reverse();

    const liqSolAmount = metadataState.data.slice(307, 315);
    liqSolAmount.reverse();

    const posState = await connection.getAccountInfo(new PublicKey("CaxYodGBcen2MVPSM1SKdAMHC2csnPSvLAZu2vkVT1H2"));
    const totalActiveBalance = posState.data.slice(160, 168);
    totalActiveBalance.reverse();

    const accountList = ["632JbevHriKtPvxncKJYa5asT76Rm77Tnrvncscufusg", "3eXy94aq5sGN3pZiJBzM6LVP4W7vNPoNbyPkpqSwBn8u", "3snom88cEW4WtXH7pHEyYHr76oMVtYqAMdJ4BtBWWaC9"]
    const accountSolBalances = await Promise.all(accountList.map(async(x) => new BN((await connection.getAccountInfo(new PublicKey(x))).lamports)))
    const solAmount = [new BN(posSolVirtualAmount), new BN(liqSolAmount), new BN(totalActiveBalance), ...accountSolBalances]

    const tvlSOL = solAmount.reduce((acc,x) => acc.add(x), new BN(0)).div(new BN(1000000000)).toNumber()

    const stakingInstanceState = await connection.getAccountInfo(new PublicKey("HNhPNHkp3RobeJzepNzyVyewtAaoF3QCCvtBTxKJVnRX"));
    const liqStakedAmtSOLAmount = stakingInstanceState.data.slice(203, 211);
    liqStakedAmtSOLAmount.reverse();

    const amtsolStakedAmount = (await connection.getTokenAccountBalance(new PublicKey("BQUHYmLH8St7j9kTWExd19QjoDuxrha7Mgp32M7zvS84"))).value.amount
    const pcuvAmtSOLAmount = (await connection.getTokenAccountBalance(new PublicKey("9QPcNgmkRAQncEnTBDXvWq2H7LY4VLNJfiVYD9c3eL8D"))).value.amount

    const amtSOLAmount = [new BN(liqStakedAmtSOLAmount), new BN(amtsolStakedAmount), new BN(pcuvAmtSOLAmount)]

    const tvlAmtSOL = amtSOLAmount.reduce((acc,x) => acc.add(x), new BN(0)).div(new BN(1000000000)).toNumber()

    return {
        'solana': tvlSOL,
        'amulet-staked-sol': tvlAmtSOL
    }
}

module.exports = {
    timetravel: false,
    solana:{
        tvl
    },
    methodology: `Amulet enables users to earn PoS staking rewards on Solana by staking SOL. Users can also earn rewards by staking SOL derivatives to underwrite covers. Hence, the amount of SOL and SOL derivatives staked are counted as our TVL which the value are calculated based on the price get from Coingecko. #The list of SOL derivatives supported can be found here: https://docs.amulet.org/documentation/use-amulet/products-and-services/underwriting-mining`
}

tvl()