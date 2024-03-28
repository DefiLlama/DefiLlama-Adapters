const { getOwnerAllAccount, getTokenAccountBalance,getSolBalance } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require('@defillama/sdk')
const { PublicKey } = require("@solana/web3.js")

const DROP = 'DropTpWcDmP7kVRUEoKSJaMVi62hGo9jp19Hz19JVsjh';
const PYTH = 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3';
const PARIMUTUEL_WALLET = 'DCa1Xir4zDEtz78beFcXCHUNXdeBnrxBiRuuapHrBE3F';
const PARIMUTUEL_ACCOUNT = 'mD62sAqPAiVbHGPTTeEianTYa1AytkKqqcxMvQxF3S3';

const predictionTokens = [
    DROP,
    PYTH
]
async function tvl(api) {

    // get the total tokens deposited in the games
    const tokensInAccount = await getOwnerAllAccount(PARIMUTUEL_WALLET);
    tokensInAccount.forEach((pToken) => {
        const total = pToken.uiAmount;
        const tokenMint = pToken.mint;
        // check to make sure it's one of the tokens used for predicting
        if (predictionTokens.includes(tokenMint))
        {
            //sdk.log('#found',tokenMint)
            api.add(tokenMint,total);
	}
    });
    const sols = await getSolBalance(PARIMUTUEL_WALLET);
    api.add(ADDRESSES.solana.SOL,sols);
}

module.exports = {
    timetravel: false,
    methodology: 'Count the number of tokens that are currently deposited in all the live prediction games',
    solana: { tvl, },
}
