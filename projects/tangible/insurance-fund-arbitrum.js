const ethers = require('ethers');

const VE_CHR_ABI = require('./abi/VeChrNFT.json');
const MULTICALL_ABI = require('./abi/Multicall3.json');

const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
const multicall = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', MULTICALL_ABI, provider);

const insuranceTokensArb = {
    CHR: '0x15b2fb8f08e4ac1ce019eadae02ee92aedf06851',
}

const VE_CHR_NFT = "0x9A01857f33aa382b1d5bb96C3180347862432B0d";

async function getInsuranceFundValueArb(api, INSURANCE_FUND) {
    const veChrContract = new ethers.Contract(VE_CHR_NFT, VE_CHR_ABI, provider);
    const veChr = new ethers.utils.Interface(VE_CHR_ABI);
    const tokenIds = await veChrContract.tokensOfOwner(INSURANCE_FUND)


    let calls = [];

    for (let i = 0; i < tokenIds.length; i++) {
        calls.push({
            target: VE_CHR_NFT,
            callData: veChr.encodeFunctionData('locked', [tokenIds[i]])
        })
    }

    const { returnData: aeroAmounts } = await multicall.callStatic.aggregate(calls);

    let tokenAmountTotal = ethers.BigNumber.from(0);
    for (let i = 0; i < aeroAmounts.length; i++) {
        const [locked] = veChr.decodeFunctionResult('locked', aeroAmounts[i]);
        tokenAmountTotal = tokenAmountTotal.add(locked);
    }

    api.add(insuranceTokensArb.CHR, tokenAmountTotal.toString())
}

module.exports = {
    getInsuranceFundValueArb,
    insuranceTokensArb
}
