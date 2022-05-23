const sdk = require("@defillama/sdk");
const abi = require('./abi.json')

const factory_contract = "0xD707d9038C1d976d3a01c770f01CB73a1fd305Cd"

const token_addresses = {
    "wUSDT": "0x32D2b9bBCf25525b8D7E92CBAB14Ca1a5f347B14",
    "wLA": "0x3a898D596840C6B6b586d722bFAdCC8c4761BF41",
    "wETH": "0x5ce9084e8ADa946AF09200c80fbAbCb1245E477F",
    "wMATIC": "0xC9AE905f288A3A3591CA7eee328eEd1568C14F32",
    "wBNB": "0x9483bDd8e088a2241f20F9241eFa3e3F6288ee20",
    "wAVAX": "0x690594910c2d58869d5F3FF205ebA1ff2A1B8245",
    "wFTM": "0x8c2E35a5825Ab407d2718402D15fFa8ec6D19acf",
    "wARBETH": "0x32DdEb2Cdd43eEF559d4B328cB14798E3C669215",
    "wHT": "0x20098F3A577fDb334FfBA2A128617664622eCBd6",
    "wONE": "0xC224866E0d39AC2d104Dd28F6398F3548ae0f318"
}

const decimals = {
    "wUSDT": 6,
    "wLA": 18,
    "wETH": 18,
    "wMATIC": 18,
    "wBNB": 18,
    "wAVAX": 18,
    "wFTM": 18,
    "wARBETH": 18,
    "wHT": 18,
    "wONE": 18
}

const pairs = [["wUSDT, wLA"]]

async function tvl(timestamp, block, chainBlocks) {
    const pair = (await sdk.api.abi.call({
        target: factory_contract,
        params: [token_addresses['wUSDT'], token_addresses['wLA']],
        abi: abi['getPair'],
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    const reserve = (await sdk.api.abi.call({
        target: pair,
        params: [],
        abi: abi['getReserves'],
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    const token0 = (await sdk.api.abi.call({
        target: pair,
        params: [],
        abi: abi['token0'],
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    const token1 = (await sdk.api.abi.call({
        target: pair,
        params: [],
        abi: abi['token1'],
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;


    console.log("pair address:: ", pair)
    console.log("reserve:: ", reserve)

    console.log("token0: ", token0)
    console.log("token1: ", token1)
    console.log("decimals: ", decimals)

    return null
};

module.exports = {
    lachain: {
        tvl : tvl
    }
};
