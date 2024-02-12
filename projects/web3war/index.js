const BSC_FPS_TOKEN_CONTRACT = "0x351dA1E7500aBA1d168b9435DCE73415718d212F";
const ZQ_FPS_TOKEN_CONTRACT = "0x241c677D9969419800402521ae87C411897A029f";
const ZQ_FPS_BRIDGE_CONTRACT = "0x6D61eFb60C17979816E4cE12CD5D29054E755948";
const ZQ_FPS_ZIL_TOKEN_ADDRESS = "zil1j2wrzjljwyjelspmtr63vfl34c467ype2w3mjl";

async function tvl(_, _a, _c, { api, chain }) {
  if (chain === "zilliqa") {
    const supply = await api.call({
      abi: "erc20:totalSupply",
      target: ZQ_FPS_TOKEN_CONTRACT,
    });

    const lockedAmount = await api.call({
      abi: "erc20:balanceOf",
      target: ZQ_FPS_TOKEN_CONTRACT,
      params: [ZQ_FPS_BRIDGE_CONTRACT],
    });
    const circulatingSupply = supply - lockedAmount;
    console.log(circulatingSupply);

    api.add(ZQ_FPS_ZIL_TOKEN_ADDRESS, circulatingSupply);
  } else {
    const supply = await api.call({
      abi: "erc20:totalSupply",
      target: BSC_FPS_TOKEN_CONTRACT,
      params: [],
    });
    console.log(supply);

    api.add(BSC_FPS_TOKEN_CONTRACT, supply);
  }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "counts number of FPS tokens across all chains",
  start: 1706517,
  bsc: {
    tvl,
  },
  zilliqa: {
    tvl,
  },
};
