const { stakings } = require("../helper/staking");
const sdk = require("@defillama/sdk");

const stakingContract = [
  "0xc947FA28527A06cEE53614E1b77620C1b7D3A75D",
  "0xCa0F390C044FD43b1F38B9D2A02e06b13B65FA48",
];

const OVR = {
  eth: "0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697",
  polygon: "0x1631244689EC1fEcbDD22fb5916E920dFC9b8D30",
};

const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const IBCO = "0x8c19cF0135852BA688643F57d56Be72bB898c411";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: () => ({}),
    staking: stakings(stakingContract, OVR.eth, "ethereum"),
    treasury: async () => {
      const treasury = (
        await sdk.api.erc20.balanceOf({
          target: DAI,
          owner: IBCO,
          chain: "ethereum",
        })
      ).output;

      return {
        [DAI]: treasury,
      };
    },
    vesting: async () => {
      const vesting = (
        await sdk.api.abi.multiCall({
          abi: "erc20:balanceOf",
          calls: [
            "0xcee8fcbc9676a08b0a048180d99b41a7f080bb78",
            "0xe6984300afd314A2F49A5869e773883CdfAe49C2",
          ].map((address) => ({
            target: OVR.eth,
            params: address,
          })),
          chain: "ethereum",
        })
      ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

      return {
        [OVR.eth]: vesting,
      };
    },
  },
  polygon: {
    tvl: async () => {
      const depositedInContracts = (
        await sdk.api.abi.multiCall({
          abi: "erc20:balanceOf",
          calls: [
            "0x7e98b560eFa48d8d04292EaF680E693F6EEfB534",
            "0x671F928505C108E49c006fb97066CFdAB34a2898",
          ].map((address) => ({
            target: OVR.polygon,
            params: address,
          })),
          chain: "polygon",
        })
      ).output.reduce((a, b) => Number(a) + Number(b.output), 0);

      return {
        [OVR.eth]: depositedInContracts,
      };
    },
  },

  methodology:
    "We count the tokens locked in the staking contract, the tokens in the IBCO reserve, and the tokens locked in vesting.",
};
