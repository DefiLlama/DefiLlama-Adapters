const sdk = require("@defillama/sdk");

const vaults = [
  "0xe6505575a49d904Aea01bB8452c94eB393EE74E0", // Team Vault
  "0x39A88389Ae0A307b9E4041d8778c8bf1ebCd54D6", // Early Bird Vault
];

const getTotalAmounts = {
  inputs: [],
  name: "getTotalAmounts",
  outputs: [
    { internalType: "uint128", name: "", type: "uint128" },
    { internalType: "uint256", name: "", type: "uint256" },
    { internalType: "uint256", name: "", type: "uint256" },
  ],
  stateMutability: "view",
  type: "function",
};
const token0Abi = require("../helper/abis/token0.json");
const token1Abi = require("../helper/abis/token1.json");

async function tvl(timestamp, block) {
  let balances = {};

  let { output: totalAmount } = await sdk.api.abi.multiCall({
    calls: vaults.map((address) => ({
      target: address,
    })),
    abi: getTotalAmounts,
    block,
  });

  let { output: token0 } = await sdk.api.abi.multiCall({
    calls: vaults.map((address) => ({
      target: address,
    })),
    abi: token0Abi,
    block,
  });

  let { output: token1 } = await sdk.api.abi.multiCall({
    calls: vaults.map((address) => ({
      target: address,
    })),
    abi: token1Abi,
    block,
  });

  for (let i = 0; i < vaults.length; i++) {

    // Gets balance in vault contracts
    let { output: token0Balance } = await sdk.api.erc20.balanceOf({
      target: token0[i].output,
      owner: vaults[i],
      block,
    });
    let { output: token1Balance } = await sdk.api.erc20.balanceOf({
      target: token1[i].output,
      owner: vaults[i],
      block,
    });

    // Sums value in vault contracts
    sdk.util.sumSingleBalance(balances, token0[i].output, token0Balance);
    sdk.util.sumSingleBalance(balances, token1[i].output, token1Balance);

    // Sums value in UNI pools
    sdk.util.sumSingleBalance(balances, token0[i].output, totalAmount[i].output[1]);
    sdk.util.sumSingleBalance(balances, token1[i].output, totalAmount[i].output[2]);

  }

  return balances;
}

module.exports = {
  methodology: "Vault TVL consists of the tokens in the vault contract and the total amount in the UNI V3 pool through the getTotalAmounts ABI call",
  ethereum: {
    tvl,
  },
  tvl,
};
