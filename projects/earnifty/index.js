const { sumTokens2 } = require('../helper/unwrapLPs')
const vaults = [
    "0xfdC1234D2a318a05D4fa1F0981472C298bfdDA3F",
    "0xEdeD16a9bB3B1E372D443988F25EA46A6cDDC8E0",
    "0x4dcd8F6550Bc87FfA8Ff62d9e69c7d1a4F8BFA91",
    "0x3A3fD40b9261F52d32f30e582ABB9B117eFe8F92",
    "0xd2765b08942e3Ef46c13b075B3b073123Dd5A45C",
    "0x56369F3D8a9F4E16bf0a30C72AeCFF19384a8DE1",
    "0xDE0da168023F408132a6e862c49768307338a4B9",
    "0x7D8632c8eeBe0c907D1d2d12a5b1D02be06EC770",
    "0x16cD4d58f255538b9883d333240fFBAAedF18a18",
    "0x0C251D467E863530CC96f2AbfAC6e75e56c4580A",
    "0x5b1Dc30d73A9dec605c37f65921cF7a817F7Fe83",
    "0xc213ccc24af674E1aaFaeBf9cF515C3aFE9ADEd0",
    "0xEEeEF0DaFA1C5666780586c07E044Ed22997f38B",
    "0x84C29eaA54a4445CDd7b46942FF96A024e41C343",
    "0x826f94E69ee4e857f1cFC32a88081763eF82691d",
    "0x4B698efC9Ab09eA9C5236620A74714fD6064627d",
    "0x230A4B30CF4B04C072018e0940f805644748530F",
    "0x4e7904eDbc49048101d32B7411d45958Af707A96",
]


async function tvl(api) {
    const tokens  = await api.multiCall({ abi: 'address:want', calls: vaults })
    const bals  = await api.multiCall({ abi: "uint256:balance", calls: vaults })
    api.add(tokens, bals)
    return sumTokens2({ api, resolveLP: true})
}


module.exports = {
    misrepresentedTokens: true,
    methodology: 'Count the token amount in each vault.',
    velas: {
        tvl,
    }
}; 