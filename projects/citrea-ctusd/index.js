const ctUsd = "0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D";
const mToken = "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b";

async function tvl(api) {
    const bal = await api.call({
        target: mToken,
        abi: "erc20:balanceOf",
        params: [ctUsd],
    })

    api.add(mToken, bal);
}

module.exports = {
    methodology: "TVL counts the total value of M tokens backing ctUSD.",
    citrea: {
        tvl,
    }
}