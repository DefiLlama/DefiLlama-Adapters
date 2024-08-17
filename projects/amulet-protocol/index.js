const BN = require("bn.js");
const { PublicKey } = require("@solana/web3.js")
const { getConnection, sumTokens2 } = require("../helper/solana");

async function tvl() {
    const connection = getConnection();
    const stakingInstanceState = await connection.getAccountInfo(new PublicKey("HNhPNHkp3RobeJzepNzyVyewtAaoF3QCCvtBTxKJVnRX"));
    const liqStakedAmtSOLAmount = stakingInstanceState.data.slice(203, 211);
    liqStakedAmtSOLAmount.reverse();
    const balances = {
        'solana:SoLW9muuNQmEAoBws7CWfYQnXRXMVEG12cQhy6LE2Zf': new BN(liqStakedAmtSOLAmount).toString()
    }
    return sumTokens2({ balances, tokenAccounts: ['BQUHYmLH8St7j9kTWExd19QjoDuxrha7Mgp32M7zvS84', '9QPcNgmkRAQncEnTBDXvWq2H7LY4VLNJfiVYD9c3eL8D'] })
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
