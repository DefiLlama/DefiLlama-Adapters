

async function tvl(api) {
    const ZeUSD = '0xe7d58E0300f628f80341b74e3664e320FB3235f3';
    try {
        const supply = await api.call({ abi: 'erc20:totalSupply', target: ZeUSD })
        // console.log(supply);
        api.add(ZeUSD, supply);
    } catch (error) {
        console.error("Failed to call totalSupply:", error);
    }
}

module.exports = {
  methodology: "Total ZeUSD Supply on all chains",
  ethereum: {
    tvl,
  },
};
