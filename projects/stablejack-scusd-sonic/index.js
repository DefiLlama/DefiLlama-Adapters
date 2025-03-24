const YT_scUSD = "0x38C6Dd3844Cc9B6276468000f7b06e8D53e5D1C0";
const PT_scUSD = "0xeAe9Cbe1277fb3DD40576db8A7B0c6bDFEB58AcA";

const STABLEJACK_SONIC_CONTRACT = "0xf41ECda82C54745aF075B79b6b31a18dD986BA4c";

async function tvl(api) {
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [
      { target: YT_scUSD, params: [STABLEJACK_SONIC_CONTRACT] },
      { target: PT_scUSD, params: [STABLEJACK_SONIC_CONTRACT] },
    ],
  });

  api.add(YT_scUSD, balances[0]);
  api.add(PT_scUSD, balances[1]);
}

module.exports = {
  methodology: 'Counts balances of YT-scUSD and PT-scUSD tokens locked in StableJack Sonic contract.',
  sonic: {
    tvl,
  },
};
