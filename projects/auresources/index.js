const UNISWAP_V2_POOL = "0xD10cC8F82bfeD86d0650a008603938f308099E3E";
const USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const AUUSD = "0xEB3669C7324B3cb1622a0A37391F5d3B8efffBc3";

async function tvl(api) {
  const [auusdBalance, usdcBalance] = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [
      { target: AUUSD, params: [UNISWAP_V2_POOL] },
      { target: USDC, params: [UNISWAP_V2_POOL] },
    ],
  });
  
  api.add(USDC, usdcBalance);
  
  const auusdInUsdc = BigInt(auusdBalance) / BigInt(10 ** 12);
  api.add(USDC, auusdInUsdc);
}

module.exports = {
  methodology: "TVL is the AuUSD/USDC Uniswap V2 pool liquidity. AuUSD is treated as $1 USD-pegged stablecoin.",
  polygon: {
    tvl,
  },
};

