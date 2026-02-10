// Nexion auto-compounding vaults: vault address -> want (LP) token
// Vaults deposit LP tokens into external MasterChef farms and auto-compound rewards
const VAULTS = {
  // ── PulseX Farm Vaults (MasterChef: 0xB2Ca4A66d3e57a5a9A12043B6bAD28249fE302d4) ──
  "0xfa6B53519D6d9e17dE9a95d6A7de1012Eb8a1B8e": "0xE56043671df55dE5CDf8459710433C10324DE0aE", // WPLS-DAI
  "0x4352c722a547911f16e10e91d76b27324b1fb6b1": "0x1b45b9148791d3a104184Cd5DFE5CE57193a3ee9", // PLSX-WPLS
  "0x87796c8394eae6a90087437f2ea34d0336dbef54": "0x6753560538ECa67617A9Ce605178F788bE7E524E", // USDC-WPLS
  "0x68e2c14e7144da2d76555f8f058490f5e76f1db9": "0x42AbdFDB63f3282033C766E72Cc4810738571609", // WETH-WPLS
  "0x75413f5e7a834cf8690d68e5520827d4280ae188": "0x322Df7921F28F1146Cdf62aFdaC0D6bC0Ab80711", // USDT-WPLS
  "0x8617cd115135d46141abe7d725813620708c9ff7": "0xf1F4ee610b2bAbB05C635F726eF8B0C568c8dc65", // HEX-WPLS
  "0xb89f2aaac4c5e24cc6e244b162ea27c504535063": "0xf808Bb6265e9Ca27002c0A04562Bf50d4FE37EAA", // INC-WPLS
  "0x0829bbc93001aafde2a9111e0b4e2fc6976717bd": "0x7Dbeca4c74d01cd8782D4EF5C05C0769723fb0ea", // INC-PLSX

  // ── EMIT Farm Vaults (MasterChef: 0x7Cc0a0ca2f9346AceAdd5110cfa15C4FA12f9251) ──
  "0xa90D59727dA9f5E99B6987B13D73EEaf109c501d": "0x1D05cC449B643633b013cbfb939e70Cc0d37F2A3", // EMIT-WPLS
  "0x0a3Ea0C4FCa0b8F893583066E53EA6a6ADf648eF": "0xeB3611c5ccae64145FAC70D7f4132cB7eb4D85d7", // INC-EMIT
  "0x41cc3268Ad337Ab11b5259aC683a42C3c25893D1": "0xE6a4005013931851424F23f3d7D1bC7Da6e6eaa9", // EMIT-PLSX
  "0x6649225B0b80b10d65654Dd395C0294adAeAe889": "0xE56043671df55dE5CDf8459710433C10324DE0aE", // WPLS-DAI EMIT
  "0xB4c3693D7A4CC1C40ce89C5d9CFE813773d1F569": "0x7Dbeca4c74d01cd8782D4EF5C05C0769723fb0ea", // INC-PLSX EMIT
  "0xde2c48806f91C4429fC1847744DdC005b046e98a": "0x1b45b9148791d3a104184Cd5DFE5CE57193a3ee9", // PLSX-WPLS EMIT
  "0x213290B1D7ceC0e311eC5Fd8A7BD7898fA62a47e": "0x9A3F2CbC18Fb61B124A5E4CC451b99F0b0eBf29C", // EMIT-vPLS
  "0x45815e3A905305CcAe7A8EE1C3eF60ED8062B188": "0x46814b3f18D90625B6E166bC2917Bb64a635d797", // WBTC-WPLS EMIT
  "0xbAA3DdbD6AB9Ad81546A2aD23e7C009e33Bb61c6": "0x2452B48a143856a8aDbDBeE4Fc02BB5e31546bD8", // EMIT-DAI
  "0xc455E22E77d20b867532d05438992535D7b47C48": "0xf1F4ee610b2bAbB05C635F726eF8B0C568c8dc65", // HEX-WPLS EMIT
  "0xFdA9a0910bCCF7DC26E2279A2e9a0286B1bBEf2E": "0x303b39DCAC8B39d84563049add635e314eBAB72A", // EMIT-PLSB
  "0x43a2da45D7f3d2DBf159301d2D6a9a1CE70bD126": "0xAd05EfD1e82c43d8ba19f857d6839a10B11A57a5", // SURF-EMIT
  "0xCE3F1F3DD298FC9B2be9b1c20D689a5853CDd723": "0x897dB4E4229d47cBe0f7cf48B8B3C2434FC0433A", // EMIT-GEL
  "0x2e08479CEAeCb88fC966c0B1f2C89F37dE5E0B3b": "0x1DDe95CA79bBA3F0dD4359aB2Cd95E0e87845eFc", // EMIT-ACTR
  "0xACD14bF26C3874003c4b524322ed6Dd144c7cAEF": "0x6BB4C527b6778B2c6194f0Ecd88f129916216eaC", // EMIT-pTGC
  "0x64C5438d4aB4e38B4992a388f63e83eCcC259438": "0xc550B17c7a86b2Bb1b92e8b08dDe4FfE517003CA", // EMIT-RHINO
  "0x7B5aeB181Ce986226FC1362809e5f9A8FD609344": "0xe7b92FDE80Ed8fb656f113D0b34E4bbB1667C3Ca", // PLSS-EMIT
  "0x09D2643e2ac274b76D7ff23017cb61B94bDF6C80": "0x617Cfc892dA221dcbaFfe902D5f62bAd169f107b", // EMIT-WBTC
  "0x117b9610DFcdA2ecC2A8EBF06C311D6dBb97E00C": "0x11C4A91ad9BC68ADadb85Fb5f0CF89e59A56C5DA", // EMIT-TETRAp
  "0x5FED7ebB15a75344B2976F52201326913e282189": "0x2497f33C98c95E8DDEeF640Af9e7a07107F062b6", // EMIT-TruFarm
  "0xDc4525269364ea26C7fd34D12c27FE3E2Fe1eA4e": "0x3Dc64DaaB2EB64A7b294d201C420Ac6F70fF9957", // EMIT-PulseCabal

  // ── TruFarm Vaults (MasterChef: 0xc9798c7447B209e79F12542691d4cdA64b98bD96) ──
  "0x9dB5e091346f9c0178B6286Fb860B0AE21cC5770": "0x086524a37dEbA61e08dc948FF677327De4a5150D", // WPLS-TruFarm
  "0x70883edec0766602b7dc9691a3e0047f08a71429": "0x09b03f6FA819e54A9A91643980151ef57E884De2", // TruFarm-DAI
  "0xbafdba5a2df8a24716e6b3043a4292c7f5c6f056": "0x2497f33C98c95E8DDEeF640Af9e7a07107F062b6", // EMIT-TruFarm
  "0xf6da9cf1cd71bd1963de51da92a6cf491bd4beb4": "0x74261876AEc8c3F8a04f311aC7Da620C48E4bf4A", // PLSX-TruFarm
  "0x8f50f7789038b56fD3e1453bce9Efe3232D3c29c": "0x149B2C629e652f2E89E11cd57e5d4D77ee166f9F", // PLSX-WPLS TruFarm
  "0x0228b23f6f2762B4C1eE2c4820618f5195A4f080": "0xaEF14d948d94050158D796912447b7992BdA9279", // TruFarm-YEP
  "0x17ceF3168505e36F85F0bB3daF79F91A63C6a2f4": "0xCB46Eb7d224aF9cB805e1630ffEFB3fF80b90B5e", // RHINO-TruFarm
  "0x8c1Ff41Cb79A7592E42767EAE53290c67acD46A8": "0xBA16AE02f37D1Caa3C5777eA5755998F0c04d3F6", // GEL-TruFarm
};

async function tvl(api) {
  const vaultAddresses = Object.keys(VAULTS);
  const lpTokens = Object.values(VAULTS);

  // Get total LP token balance managed by each vault (vault + strategy + masterchef)
  const vaultBalances = await api.multiCall({
    abi: "uint256:balance",
    calls: vaultAddresses,
  });

  // Aggregate balances per unique LP token (some vaults share the same LP)
  const lpBalances = {};
  vaultBalances.forEach((bal, i) => {
    const lp = lpTokens[i];
    lpBalances[lp] = (BigInt(lpBalances[lp] || 0) + BigInt(bal)).toString();
  });

  const uniqueLPs = Object.keys(lpBalances);

  // Get token0, token1, reserves, totalSupply for each LP to manually unwrap
  const [token0s, token1s, reserves, supplies] = await Promise.all([
    api.multiCall({ abi: "address:token0", calls: uniqueLPs }),
    api.multiCall({ abi: "address:token1", calls: uniqueLPs }),
    api.multiCall({
      abi: "function getReserves() view returns (uint112, uint112, uint32)",
      calls: uniqueLPs,
    }),
    api.multiCall({ abi: "uint256:totalSupply", calls: uniqueLPs }),
  ]);

  // Calculate proportional token amounts for each LP position
  uniqueLPs.forEach((lp, i) => {
    const balance = BigInt(lpBalances[lp]);
    const supply = BigInt(supplies[i]);
    if (supply === 0n) return;

    const reserve0 = BigInt(reserves[i][0]);
    const reserve1 = BigInt(reserves[i][1]);

    const amount0 = (balance * reserve0) / supply;
    const amount1 = (balance * reserve1) / supply;

    api.add(token0s[i], amount0.toString());
    api.add(token1s[i], amount1.toString());
  });

  return api.getBalances();
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  methodology:
    "TVL is the total value of LP tokens deposited in Nexion auto-compounding vaults. Vaults deposit into external PulseX, EMIT, and TruFarm MasterChef contracts and auto-compound harvested rewards.",
  pulse: {
    tvl,
  },
};
