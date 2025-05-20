const { BackstopToken } = require("@blend-capital/blend-sdk");
const { getTokenBalance } = require("../helper/chain/stellar");

const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";
const BACKCSTOP_TOKEN_ID = "CAS3FL6TLZKDGGSISDBWGGPXT3NRR4DYTZD7YOD3HMYO6LTJUVGRVEAM";
const USDC_ID = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
const BLND_ID = "CD25MNVTZDL4Y3XBCPCJXGXATV5WUHHOWMYFF4YBEGU5FCPGMYTVG5JY";

const network = {
  rpc: "https://soroban-rpc.creit.tech/",
  passphrase: "Public Global Stellar Network ; September 2015",
};

async function tvl(api) {
  let backstopTokeData = await BackstopToken.load(
    network,
    BACKCSTOP_TOKEN_ID,
    BLND_ID,
    USDC_ID
  );
  
  let totalBackstopTokens = await getTokenBalance(
    BACKCSTOP_TOKEN_ID,
    BACKSTOP_ID
  );
  let totalBLND = Number(totalBackstopTokens) * backstopTokeData.blndPerLpToken;
  let totalUSDC = Number(totalBackstopTokens) * backstopTokeData.usdcPerLpToken;
  api.add(USDC_ID, Math.floor(totalUSDC));
  api.add(BLND_ID, Math.floor(totalBLND));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: `Counts the total amount of BLND-USDC LP shares held by the Blend backstop contract.`,
  hallmarks: [
    [1745478927, "Calculate TVL using BLND Coin Gecko price instead of approximation via pool weights"],
    [1745858101, "Only account for lp tokens held by the backstop contract"],
  ],
  stellar: {
    tvl: () => ({}),
    pool2: tvl
  },
};
