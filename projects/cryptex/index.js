const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");

const ctxToken = "0x321c2fe4446c7c963dc41dd58879af648838f98d";
const factory = "0x70236b36f86AB4bd557Fe9934E1246537B472918";

const stakingContracts = [
  "0xc8BB1cd417D20116387a5e0603e195cA4f3Cf59A", //TCAP-WETH
  "0xdC4cDd5dB9EE777EFD891690dc283638CB3A5f94" //CTX-WETH
];

const treasuryAddress = "0xa54074b2cc0e96a43048d4a68472F7F046aC0DA8";

async function tvl(timestamp, block) {
  let balances = {};

  const results = await sdk.api.abi.multiCall({
    block,
    abi: "erc20:balanceOf",
    calls: [
      {
        target: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        params: ["0x717170b66654292dfbd89c39f5ae6753d2ac1381"],
      },
      {
        target: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        params: ["0x443366a7a5821619d8d57405511e4fadd9964771"],
      },
    ],
  });
  sdk.util.sumMultiBalanceOf(balances, results);

  return balances;
}

async function pool2(timestamp, block) {
  let balances = {};

  let stakingTokens = (await sdk.api.abi.multiCall({
    calls: stakingContracts.map(p => ({
      target: p
    })),
    abi: {"inputs":[],"name":"stakingToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    block,
  })).output;

  let stakingBalances = (await sdk.api.abi.multiCall({
    calls: stakingTokens.map(p => ({
      target: p.output,
      params: p.input.target
    })),
    abi: "erc20:balanceOf",
    block
  })).output;

  let lpTokens = [];
  stakingBalances.forEach(i => {
    lpTokens.push({
      balance: i.output,
      token: i.input.target
    });
  })

  await unwrapUniswapLPs(balances, lpTokens, block);

  return balances;
}

async function staking(timestamp, block) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: ctxToken,
    owner: factory,
    block,
  });

  sdk.util.sumSingleBalance(balances, ctxToken, balance);

  return balances;
}

async function treasury(timestamp, block) {
  let balances = {};
  let ethBalance = (await sdk.api.eth.getBalance({
    target: treasuryAddress,
    block
  })).output;
  let ctxBalance = (await sdk.api.erc20.balanceOf({
    target: ctxToken,
    owner: treasuryAddress,
    block
  })).output;
  sdk.util.sumSingleBalance(balances, "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", ethBalance);
  sdk.util.sumSingleBalance(balances, ctxToken, ctxBalance);
  return balances;
}

module.exports = {
  methodology: "TVL is calculated by the WETH and DAI used to mint TCAP. Pool2 TVL is calculated from the SLP staked in the SushiSwap pools. Staking TVL is calculated by the CTX staked in the DelegatorFactory. Treasury TVL is calculated by the CTX and ETH in the treasury contract.",
  ethereum: {
    tvl,
    pool2,
    staking,
    treasury
  },
  tvl,
};
