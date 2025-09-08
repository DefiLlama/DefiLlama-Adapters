const BASE_CONTRACT = "0xD4F3Ba2Fe4183c32A498Ad1ecF9Fc55308FcC029";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const AUSDC_BASE = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB";
 

async function tvl(api) {
  const balance = await api.call({
    abi: "erc20:balanceOf",
    target: AUSDC_BASE,
    params: [BASE_CONTRACT],
  });

  // agregamos al TVL
  api.add(USDC_BASE, balance);
}

module.exports = {
  methodology:
    "Total value of all coins held in the Yield Millionaire contracts",
  base: {
    tvl,
  },
};
