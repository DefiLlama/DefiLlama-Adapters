const ctUsd = "0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D";
const mToken = "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b";

async function tvl(api) {
    const bal = await api.call({
        target: mToken,
        abi: "function balanceOf(address account) view returns (uint256)",
        params: [ctUsd],
    })

    api.addCGToken('wrappedm-by-m0', bal / 1e6);
}

module.exports = {
    methodology: "TVL counts the total value of M tokens backing ctUSD.",
    citrea: {
        tvl,
    }
}