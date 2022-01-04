const sdk = require("@defillama/sdk");
const axios = require("axios");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

/* Note: there are LON staked tokens within the protocol, accounting for aprox $30M at current market price
 *  but the protocol itself are minting them...
 */

// Used for grabbing AMM wrapper & PMM
const PERMANENT_STORAGE_PROXY = "0x6D9Cc14a1d36E6fF13fc6efA9e9326FcD12E7903";

const STAGES_STAKING_CONTRACTS = [
  //FIRST_STAGE
  "0x929CF614C917944dD278BC2134714EaA4121BC6A",
  //SECOND_STAGE_LON_ETH
  "0xc348314f74b043ff79396e14116b6f19122d69f4",
  //SECOND_STAGE_LON_USDT
  "0x11520d501e10e2e02a2715c4a9d3f8aeb1b72a7a",
  //THIRD_STAGE_LON_ETH
  "0x74379CEC6a2c9Fde0537e9D9346222a724A278e4",
  //THIRD_STAGE_LON_USDT
  "0x539a67b6f9c3cad58f434cc12624b2d520bc03f8"
];

// Receives rewards/fee from AMM wrapper via reward distributor on WETH shape, some are sold for LON...
const MULTISIG_ONE = "0x74C3cA9431C009dC35587591Dc90780078174f8a";

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const targetBalances = async (balances, address, block) => {
  let token_in_address = (
    await axios.get(
      `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
    )
  ).data.data.items
    .map((each) => each.contract_address) //contract does not hold ETH
    .filter((addr) => addr != "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");

  for (let i = 0; i < token_in_address.length; i++) {
    let result = (
      await sdk.api.erc20.balanceOf({
        target: token_in_address[i],
        owner: address,
        block,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, token_in_address[i], result);
  }
};

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const block = ethBlock;

  const amm_wrapper_addr = (
    await sdk.api.abi.call({
      abi: abi.ammWrapperAddr,
      target: PERMANENT_STORAGE_PROXY,
      block,
    })
  ).output;

  await targetBalances(balances, amm_wrapper_addr, block);

  const pmm_addr = (
    await sdk.api.abi.call({
      abi: abi.pmmAddr,
      target: PERMANENT_STORAGE_PROXY,
      block,
    })
  ).output;

  await targetBalances(balances, pmm_addr, block);

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.stakingToken,
      calls: STAGES_STAKING_CONTRACTS.map((addr) => ({ target: addr })),
      block,
    })
  ).output.map((el) => el.output);

  const lpPositions = [];

  for (let i = 0; i < lpTokens.length; i++) {
    let balance = (
      await sdk.api.erc20.balanceOf({
        target: lpTokens[i],
        owner: STAGES_STAKING_CONTRACTS[i],
        block,
      })
    ).output;

    lpPositions.push({
      token: lpTokens[i],
      balance,
    });
  }

  await unwrapUniswapLPs(balances, lpPositions, block);

  let multisig_weth_balance = (
    await sdk.api.erc20.balanceOf({
      target: WETH,
      owner: MULTISIG_ONE,
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, WETH, multisig_weth_balance);

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
