const YT_scUSD = "0xd2901D474b351bC6eE7b119f9c920863B0F781b2";
const PT_scUSD = "0x11d686EF994648Ead6180c722F122169058389ee";

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
