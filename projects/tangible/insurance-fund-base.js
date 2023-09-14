const ethers = require('ethers');

const VE_AERO_ABI = require('./abi/VeVeloNFT.json');
const MULTICALL_ABI = require('./abi/Multicall3.json');

const provider = new ethers.providers.JsonRpcProvider('https://developer-access-mainnet.base.org');
const multicall = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', MULTICALL_ABI, provider);

const insuranceTokensBase = {
    AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
}

const VE_AERO_NFT = "0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4";

async function getInsuranceFundValueBase(api, INSURANCE_FUND) {
    const veAeroContract = new ethers.Contract(VE_AERO_NFT, VE_AERO_ABI, provider);
    const totalTokenAmount = await veAeroContract.balanceOf(INSURANCE_FUND)
    const veAero = new ethers.utils.Interface(VE_AERO_ABI);

    let calls = [];

    for (let i = 0; i < totalTokenAmount; i++) {
        calls.push({
            target: VE_AERO_NFT,
            callData: veAero.encodeFunctionData('ownerToNFTokenIdList', [INSURANCE_FUND, i])
        })
    }

    const { returnData: veNftTokens } = await multicall.callStatic.aggregate(calls);
    
    const tokenIds = []
    for (let i = 0; i < veNftTokens.length; i++) {
        const [tokenId] = veAero.decodeFunctionResult('ownerToNFTokenIdList', veNftTokens[i]);
        tokenIds.push(tokenId);
    }

    calls = [];

    for (let i = 0; i < tokenIds.length; i++) {
        calls.push({
            target: VE_AERO_NFT,
            callData: veAero.encodeFunctionData('locked', [tokenIds[i]])
        })
    }

    const { returnData: aeroAmounts } = await multicall.callStatic.aggregate(calls);

    let tokenAmountTotal = ethers.BigNumber.from(0);
    for (let i = 0; i < aeroAmounts.length; i++) {
        const [locked] = veAero.decodeFunctionResult('locked', aeroAmounts[i]);
        tokenAmountTotal = tokenAmountTotal.add(locked.amount);
    }

    api.add(insuranceTokensBase.AERO, tokenAmountTotal.toString())
}

module.exports = {
    getInsuranceFundValueBase,
    insuranceTokensBase
}
