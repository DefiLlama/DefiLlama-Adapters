const sdk = require("@defillama/sdk");
const { transformAvaxAddress } = require("../helper/portedTokens");

const toAddr = (d) => "0x" + d.substr(26);

async function calcTVL(
  betaBankAddress,
  collaterals,
  _chain,
  _timestamp,
  _fromBlock,
  _toBlock
) {
  const transform = (_chain == 'avax' ? await transformAvaxAddress() : a => (a))
  const bTokens = (
    await sdk.api.util.getLogs({
      target: betaBankAddress,
      topic: "Create(address,address)",
      fromBlock: _fromBlock,
      toBlock: _toBlock,
      keys: [],
      chain: _chain,
    })
  ).output
    .map((bt) => ({
      target: toAddr(bt.topics[1]),
      params: [toAddr(bt.data)],
    }))
    .concat(
      collaterals.map((c) => ({
        target: c,
        params: [betaBankAddress],
      }))
    );
  const balanceOf = await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: bTokens,
    block: _toBlock,
    chain: _chain,
  });
  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, balanceOf, true, transform);
  return balances;
}

async function tvlEth(_timestamp, block) {
  const betaBankAddress = "0x972a785b390D05123497169a04c72dE652493BE1";
  const collaterals = [
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  ];

  const chain = "ethereum";
  const fromBlock = 13004429;

  return calcTVL(
    betaBankAddress,
    collaterals,
    chain,
    _timestamp,
    fromBlock,
    block
  );
}

async function tvlAvax(_timestamp, block, chainBlocks) {
  const betaBankAddress = "0xf3a82ddd4fbf49a35eccf264997f82d40510f36b";
  const collaterals = [
    "0xc7198437980c041c805a1edcba50c1ce5db95118",
    "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
    "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
    "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
    "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  ];

  const chain = "avax";
  const fromBlock = 8495306;

  return calcTVL(
    betaBankAddress,
    collaterals,
    chain,
    _timestamp,
    fromBlock,
    chainBlocks.avax
  );
}

module.exports = {
  methodology:
    "TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
  ethereum: {
    tvl: tvlEth,
  },
  avalanche: {
    tvl: tvlAvax,
  },
};
