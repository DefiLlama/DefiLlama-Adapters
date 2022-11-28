const sdk = require("@defillama/sdk");
const abi = require("./abis");

// Tokens
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

// Vaults
const v2 = "0xf896527c49b44aAb3Cf22aE356Fa3AF8E331F280";
const v2_1 = "0x8252Df1d8b29057d1Afe3062bf5a64D503152BC8";

const COLLECTION_TO_FEED = [
    {   // Art Blocks
        address: "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a",
        oracle: "0xEbF67AB8cFF336D3F609127E8BbF8BD6DD93cd81",
    },
    {   // Azuki
        address: "0xed5af388653567af2f388e6224dc7c4b3241c544",
        oracle: "0xA9cdBbDE36803af377735233e6BD261cDA5aD11d",
    },
    {   // BAKC
        address: "0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623",
        oracle: "0x17297f67e84b4fD7301161398F87a7f22a44DA7f",
    },
    {   // BAYC
        address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        oracle: "0x0CA05B24795eb4f5bA5237e1D4470048cc0fE235",
    },
    {   // Beanz
        address: "0x306b1ea3ecdf94aB739F1910bbda052Ed4A9f949",
        oracle: "0x5524b79F4E2D1289fcCc8Aa78eaE34D8C6daBE37",
    },
    {   // CloneX
        address: "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b",
        oracle: "0x13E6C463BEC76873E4e63ce5169e9a95b7e06801",
    },
    {   // Cool Cats
        address: "0x1A92f7381B9F03921564a437210bB9396471050C",
        oracle: "0xB9D28F5a83f00c2558f7CBd8f10252D39cF15AE4",
    },
    {   // Cryptoadz
        address: "0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6",
        oracle: "0x3c8D79D378366c9f118109B87edEdB448C6EfbbA",
    },
    {   // Cryptodickbutts
        address: "0x42069ABFE407C60cf4ae4112bEDEaD391dBa1cdB",
        oracle: "0x22Ab04060Bb1891b84F19334076B051240BA92E1",
    },
    {   // Cryptopunks
        address: "0xb7f7f6c52f2e2fdb1963eab30438024864c313f6",
        oracle: "0x35f08E1b5a18F1F085AA092aAed10EDd47457484",
    },
    {   // Cyberbrokers
        address: "0x892848074ddeA461A15f337250Da3ce55580CA85",
        oracle: "0x2d6696be4fce9c6707dea0c328a7842aea80ed51",
    },
    {   // Decentraland
        address: "0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d",
        oracle: "0xf0294D938624859Ea5705C6F4Cb2436cc840d04b",
    },
    {   // Digidaigaku
        address: "0xd1258DB6Ac08eB0e625B75b371C023dA478E94A9",
        oracle: "0x071FE3f051cA7D41fF1Cd08A94368B0d0703f9b1",
    },
    {   // Doodles
        address: "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e",
        oracle: "0x68Ff67118F778Bd158DA8D49B156aC5Ad9d8c4Ed",
    },
    {   // Forgotten Rune Wizards Cult
        address: "0x521f9C7505005CFA19A8E5786a9c3c9c9F5e6f42",
        oracle: "0x4da2765FFCFC0eEd625F450B9A1A1C89c919DbE8",
    },
    {   // Goblin Town
        address: "0xbCe3781ae7Ca1a5e050Bd9C4c77369867eBc307e",
        oracle: "0x11a67a301b80BC9b8cC0A5826b84876fb8542CaF",
    },
    {   // LobsterDAO
        address: "0x026224A2940bFE258D0dbE947919B62fE321F042",
        oracle: "0xd2fa1CAcF83C9889f215d0492BFceE717D149a6e",
    },
    {   // MAYC
        address: "0x60e4d786628fea6478f785a6d7e704777c86a7c6",
        oracle: "0xE6A7b525609bF47889ac9d0e964ebB640750a01C",
    },
    {   // Meebits
        address: "0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7",
        oracle: "0x29Ea94760f211A338eCef4a31F09d8Cef1795755",
    },
    {   // Milady
        address: "0x5Af0D9827E0c53E4799BB226655A1de152A425a5",
        oracle: "0xf04205d907aD314c717EFec0d2D3d97626130E19",
    },
    {   // Moonbirds
        address: "0x23581767a106ae21c074b2276d25e5c3e136a68b",
        oracle: "0x16De3b3D1620675D7BD240abEf4CE4F119462Bbd",
    },
    {   // Nouns
        address: "0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03",
        oracle: "0x363B6E3648847B988B7C8E3A306e0881BdEE24Bd",
    },
    {   // Otherdeed
        address: "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258",
        oracle: "0xAa6128fAdBd64aAd55d2A235827d976508649509",
    },
    {   // Pudgy Penguins
        address: "0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
        oracle: "0xaC9962D846D431254C7B3Da3AA12519a1E2Eb5e7",
    },
    {   // Sandbox Land
        address: "0x5cc5b05a8a13e3fbdb0bb9fccd98d38e50f90c38",
        oracle: "0xa62b4828a9f4b2e3cba050c6befdd8f0a0056af4",
    },
    {   // VeeFriends
        address: "0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb",
        oracle: "0x94360bfC0Fc7191D6195395351b1fb8e03Cd0c24",
    },
    {   // World of Women
        address: "0xe785e82358879f061bc3dcac6f0444462d4b5330",
        oracle: "0x9996adBA1BA04635f2567210fA42e1ff185E201F",
    },
];

async function getTVL(balances, chain, timestamp, chainBlocks) {
    // Get v2 deposited collateral
    const { output: v2Positions } = await sdk.api.abi.multiCall({
        calls: COLLECTION_TO_FEED.map((collToFeed) => ({
            target: collToFeed.address, params: [v2]
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
    });

    // Get v2_1 deposited collateral
    const { output: v21Positions } = await sdk.api.abi.multiCall({
        calls: COLLECTION_TO_FEED.map((collToFeed) => ({
            target: collToFeed.address, params: [v2_1]
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
    });

    // Get floor prices from Chainlink feeds
    const { output: floorPrices } = await sdk.api.abi.multiCall({
        calls: COLLECTION_TO_FEED.map((collToFeed) => ({
            target: collToFeed.oracle,
        })),
        abi: abi.abis.latestAnswer,
        block: chainBlocks[chain],
        chain,
    });

    let collateralValueETH = 0;
    for (let i = 0; i < v2Positions.length; i++) {
        const floorPrice = floorPrices[i].output;
        const position = Number(v2Positions[i].output) + Number(v21Positions[i].output);
        collateralValueETH += position * floorPrice;
    }

    sdk.util.sumSingleBalance(balances, `${chain}:${WETH}`, collateralValueETH);
    return balances;
}

module.exports = {
    getTVL,
};
