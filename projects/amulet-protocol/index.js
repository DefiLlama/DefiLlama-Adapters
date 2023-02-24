const BN = require("bn.js");
const { PublicKey } = require("@solana/web3.js")
const { getConnection } = require("../helper/solana");

async function tvl() {
    const connection = getConnection();
    const stakingInstanceState = await connection.getAccountInfo(new PublicKey("HNhPNHkp3RobeJzepNzyVyewtAaoF3QCCvtBTxKJVnRX"));
    const liqStakedAmtSOLAmount = stakingInstanceState.data.slice(203, 211);
    liqStakedAmtSOLAmount.reverse();

    const amtsolStakedAmount = (await connection.getTokenAccountBalance(new PublicKey("BQUHYmLH8St7j9kTWExd19QjoDuxrha7Mgp32M7zvS84"))).value.amount
    const pcuvAmtSOLAmount = (await connection.getTokenAccountBalance(new PublicKey("9QPcNgmkRAQncEnTBDXvWq2H7LY4VLNJfiVYD9c3eL8D"))).value.amount

    const amtSOLAmount = [new BN(liqStakedAmtSOLAmount), new BN(amtsolStakedAmount), new BN(pcuvAmtSOLAmount)]

    const tvlAmtSOL = amtSOLAmount.reduce((acc,x) => acc.add(x), new BN(0)).div(new BN(1000000000)).toNumber()

    return {
        'amulet-staked-sol': tvlAmtSOL
    }
}

module.exports = {
    timetravel: false,
    solana:{
        tvl
    },
    methodology: `Amulet provides solution which allows user to to earn rewards from underwriting covers with SOL derivatives token (amtSOL). Hence, the amount of SOL derivatives staked are counted as our TVL which the value are calculated based on the price get from Coingecko.`,
    hallmarks: [
        [1667692800, "FTX collapse"]
    ],
}
