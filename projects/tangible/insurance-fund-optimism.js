const ethers = require('ethers');

const VE_VELO_ABI = require('./abi/VeVeloNFT.json');
const MULTICALL_ABI = require('./abi/Multicall3.json');

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.optimism.io');
const multicall = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', MULTICALL_ABI, provider);

const insuranceTokensOp = {
    VELO: '0x9560e827af36c94d2ac33a39bce1fe78631088db',
}

const VE_VELO_NFT = "0xFAf8FD17D9840595845582fCB047DF13f006787d";

async function getInsuranceFundValueOp(api, INSURANCE_FUND) {
    const veVeloContract = new ethers.Contract(VE_VELO_NFT, VE_VELO_ABI, provider);
    const totalTokenAmount = await veVeloContract.balanceOf(INSURANCE_FUND)
    const veVelo = new ethers.utils.Interface(VE_VELO_ABI);

    let calls = [];

    for (let i = 0; i < totalTokenAmount; i++) {
        calls.push({
            target: VE_VELO_NFT,
            callData: veVelo.encodeFunctionData('ownerToNFTokenIdList', [INSURANCE_FUND, i])
        })
    }

    const { returnData: veNftTokens } = await multicall.callStatic.aggregate(calls);
    
    const tokenIds = []
    for (let i = 0; i < veNftTokens.length; i++) {
        const [tokenId] = veVelo.decodeFunctionResult('ownerToNFTokenIdList', veNftTokens[i]);
        tokenIds.push(tokenId);
    }

    calls = [];

    for (let i = 0; i < tokenIds.length; i++) {
        calls.push({
            target: VE_VELO_NFT,
            callData: veVelo.encodeFunctionData('locked', [tokenIds[i]])
        })
    }

    const { returnData: veloAmounts } = await multicall.callStatic.aggregate(calls);

    let tokenAmountTotal = ethers.BigNumber.from(0);
    for (let i = 0; i < veloAmounts.length; i++) {
        const [locked] = veVelo.decodeFunctionResult('locked', veloAmounts[i]);
        tokenAmountTotal = tokenAmountTotal.add(locked.amount);
    }

    api.add(insuranceTokensOp.VELO, tokenAmountTotal.toString())
}

module.exports = {
    getInsuranceFundValueOp,
    insuranceTokensOp
}
