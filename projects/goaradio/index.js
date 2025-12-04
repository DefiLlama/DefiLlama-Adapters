const GOA_TOKEN = "0x625655d74289dc0C9fD3e16E762c93a9e6c106e4";

const LISTEN2EARN_CONTRACT = "0xA82e46a0Dd81217609FBe507De7213b93Aa5aa0e";
const VIEW2EARN_CONTRACT = "0x496Bb0D6440012E0a2eDa1BAbeBdd7310aeb1a54";

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)"
];

async function tvl(api) {
  let listenBalance = 0;
  let viewBalance = 0;

  // Fetch GOA balance from Listen2Earn contract
  try {
    listenBalance = await api.call({
      abi: ERC20_ABI,
      target: GOA_TOKEN,
      params: [LISTEN2EARN_CONTRACT],
    });
  } catch (e) {
    console.error("Error fetching Listen2Earn balance:", e);
  }

  // Fetch GOA balance from View2Earn contract
  try {
    viewBalance = await api.call({
      abi: ERC20_ABI,
      target: GOA_TOKEN,
      params: [VIEW2EARN_CONTRACT],
    });
  } catch (e) {
    console.error("Error fetching View2Earn balance:", e);
  }

  api.add(GOA_TOKEN, listenBalance);
  api.add(GOA_TOKEN, viewBalance);
}

module.exports = {
  methodology: "TVL counts GOA tokens locked in Listen2Earn and View2Earn contracts on Goaradio chain.",
  start: 1735728000,
  hallmarks: [
    [1735728000, "Goaradio chain launch"]
  ],
  timetravel: true,
  misrepresentedTokens: false,
  saga: { 
    tvl,
  },
};
