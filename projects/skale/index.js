const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, block, _c) {
    
    const etherAddress = ADDRESSES.null;

    const depositBoxETH = '0x49F583d263e4Ef938b9E09772D3394c71605Df94';
    const depositBoxERC20 = '0x8fB1A35bB6fB9c47Fb5065BE5062cB8dC1687669';

    const toa = [
        [etherAddress, depositBoxETH]
    ];

    const erc20Tokens = [
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.LINK,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.RETH,
        '0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7', // SKL
        '0x50de6856358cc35f3a9a57eaaa34bd4cb707d2cd', // Razor
        '0x8e870d67f660d95d5be530380d0ec0bd388289e1', // USDP
        '0x02de007d412266a2e0fa9287c103474170f06560', // Exorde
        '0xd1ba9BAC957322D6e8c07a160a3A8dA11A0d2867', // Human Token
        '0x6307B25A665Efc992EC1C1bC403c38F3dDd7c661', // GCR
        '0x3300b02efa180c99a2f61f4731665b51e4e254c4', // Hitmakr
        '0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198', // BANK
        '0x0954906da0Bf32d5479e25f46056d22f08464cab', // index
        '0x0E186357c323c806C1efdad36D217F7a54b63D18', // CGT2.0
        '0x6982508145454ce325ddbe47a25d4ec3d2311933', // PEPE
        '0xfdcdfa378818ac358739621ddfa8582e6ac1adcb', // CSC
    ];

    erc20Tokens.map(i => {
        toa.push([i, depositBoxERC20])
    });

    return sumTokens2({
        block,
        tokensAndOwners: toa
    });
}

module.exports = {
    start: 12858653, // Mon July 19 06:38:20 PM UTC 2021
    skale: {
        tvl
    }
}