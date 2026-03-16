const SIGNALS_CORE = "0x516312275875932ec2B53A41df4De02743131729";
const CTUSD = "0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D";

async function tvl(api) {
  const balance = await api.call({
    abi: "erc20:balanceOf",
    target: CTUSD,
    params: [SIGNALS_CORE],
  });
  api.add(CTUSD, balance);
}

module.exports = {
  methodology:
    "TVL is ctUSD deposited in the SignalsCore contract as liquidity for range-based prediction markets on Citrea.",
  citrea: {
    tvl,
  },
};
