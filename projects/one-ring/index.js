const ethers = require("ethers");
const STAKING_LP_USDC_DOLA = "0x33ff52D1c4b6973CD5AF41ad53Dd92D99D31D3c3";
const LP_USDC_DOLA = "0xB720FBC32d60BB6dcc955Be86b98D8fD3c4bA645";
const USDC = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";
const DOLA = "0x8aE125E8653821E851F12A49F7765db9a9ce7384";

function sumValuesWithDifferentDecimals(
  amount0,
  decimals0,
  amount1,
  decimals1
) {
  const amount0Formatted = ethers.utils.formatUnits(amount0, decimals0);
  const amount1Formatted = ethers.utils.formatUnits(amount1, decimals1);

  const value0Balance = ethers.utils.parseUnits(amount0Formatted, decimals0);
  const value1Balance = ethers.utils.parseUnits(amount1Formatted, decimals1);

  // Determine the maximum decimal places
  const maxDecimals = Math.max(decimals0, decimals1);

  // Adjust the balances to have the same decimal places
  const adjustedValue0Balance = value0Balance.mul(
    10 ** (maxDecimals - decimals0)
  );
  const adjustedValue1Balance = value1Balance.mul(
    10 ** (maxDecimals - decimals1)
  );

  // Sum the adjusted balances
  const total = adjustedValue0Balance.add(adjustedValue1Balance);

  // Format the total balance with the desired decimal places
  const totalFormatted = ethers.utils.formatUnits(total, maxDecimals);

  return Number(totalFormatted);
}

async function tvl(_, _1, _2, { api }) {
  const totalStaked = await api.call({
    chain: "optimism",
    abi: "uint256:totalStaked",
    target: STAKING_LP_USDC_DOLA,
    params: [],
  });

  const totalSupply = await api.call({
    chain: "optimism",
    abi: "erc20:totalSupply",
    target: LP_USDC_DOLA,
    params: [],
  });

  const usdcBalance = await api.call({
    chain: "optimism",
    abi: "erc20:balanceOf",
    target: USDC,
    params: [LP_USDC_DOLA],
  });

  const dolaBalance = await api.call({
    chain: "optimism",
    abi: "erc20:balanceOf",
    target: DOLA,
    params: [LP_USDC_DOLA],
  });

  const ts = Number(ethers.utils.formatEther(totalSupply));
  const tskd = Number(ethers.utils.formatEther(totalStaked));

  const totalBalance = sumValuesWithDifferentDecimals(
    usdcBalance,
    6,
    dolaBalance,
    18
  );

  const total = (tskd / ts) * totalBalance;
  api.add(USDC, total * 1e6);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Calculate TVL of staking lp product",
  // start: 1000235,
  optimism: {
    tvl,
  },
};

// const MINT_TOKEN_CONTRACT = "0x1f3Af095CDa17d63cad238358837321e95FC5915";
// const MINT_CLUB_BOND_CONTRACT = "0x8BBac0C7583Cc146244a18863E708bFFbbF19975";

// async function tvl(_, _1, _2, { api }) {
//   const coco = await api.call({
//     abi: "erc20:balanceOf",
//     target: MINT_TOKEN_CONTRACT,
//     params: [MINT_CLUB_BOND_CONTRACT],
//   });

//   api.add(MINT_TOKEN_CONTRACT, coco);
// }

// module.exports = {
//   // timetravel: true,
//   // misrepresentedTokens: false,
//   // methodology: "counts the number of MINT tokens in the Club Bonding contract.",
//   // start: 1000235,
//   bsc: {
//     tvl,
//   },
// };
