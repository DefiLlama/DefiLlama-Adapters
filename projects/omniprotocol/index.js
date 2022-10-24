const sdk = require("@defillama/sdk");
const {
  getTvl,
  getBorrowed,
  getOmniReserves,
} = require("./helper.js");
const abi = require("./omni.json");
const { default: BigNumber } = require("bignumber.js");

const validProtocolDataHelper = "0x8AAc97e25c79195aC77817287Cf512b0Acc9da44";
const omniOracle = "0x08Eaf1C8c270a485DD9c8aebb2EDE3FcAe72e04f";
const ETH = "0x0000000000000000000000000000000000000000";

function totalTvl() {
  return async (timestamp, block) => {
    const balances = {
      [ETH]: 0,
    };

    // get all derivative and underlying tokens
    const [otokens, reserveTokens, dataHelper] = await getOmniReserves(
      block,
      "ethereum",
      validProtocolDataHelper
    );

    // get balance of all supplied assets in protocol
    const protocolBalance = await getTvl(
      block,
      "ethereum",
      otokens,
      reserveTokens
    );

    // get decimals for all assets - ERC721 will return null
    let { output: decimals } = await sdk.api.abi.multiCall({
      calls: protocolBalance.map((asset, index) => ({
        target: asset.asset,
      })),
      abi: "erc20:decimals",
      block,
      chain: "ethereum",
    });

    // fetch prices for every asset in single call
    const { output: prices } = await sdk.api.abi.call({
      target: omniOracle,
      params: [protocolBalance.map((item) => item.asset)],
      abi: abi["getAssetsPrices"],
    });

    protocolBalance.map((val, index) => {
      let isNft = !decimals[index].success;

      if (isNft) {
        // treat NFT's as their underlying floor balance
        let price = prices[index];
        balances[ETH] += BigNumber(val.output) * BigNumber(price);
      } else {
        balances[val.asset] = val.output;
      }
    });

    return balances;
  };
}

function totalBorrowed() {
  return async (timestamp, block) => {
    const balances = {
      [ETH]: 0,
    };

    // get all derivative and underlying tokens
    const [otokens, reserveTokens, dataHelper] = await getOmniReserves(
      block,
      "ethereum",
      validProtocolDataHelper
    );

    // get balance of all borrowed assets in protocol
    const protocolBorrowed = await getBorrowed(
      block,
      "ethereum",
      reserveTokens,
      dataHelper
    );

    // get decimals for all assets - ERC721 will return null
    let { output: decimals } = await sdk.api.abi.multiCall({
      calls: protocolBorrowed.map((asset, index) => ({
        target: asset.asset,
      })),
      abi: "erc20:decimals",
      block,
      chain: "ethereum",
    });

    // fetch prices for every asset in single call
    const { output: prices } = await sdk.api.abi.call({
      target: omniOracle,
      params: [protocolBorrowed.map((item) => item.asset)],
      abi: abi["getAssetsPrices"],
    });

    protocolBorrowed.map((borrowed, index) => {
      let isNft = !decimals[index].success;
      let totalDebt = borrowed.variable + borrowed.stable;

      if (isNft) {
        // treat NFT's as their underlying floor balance
        let price = prices[index];
        balances[ETH] += BigNumber(totalDebt) * BigNumber(price);
      } else {
        balances[borrowed.asset] = totalDebt;
      }
    });

    return balances;
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. NFT's are counted as their floor price for both collateral and debt. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  ethereum: {
    tvl: totalTvl(),
    borrowed: totalBorrowed(),
  },
};