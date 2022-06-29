const axios = require("axios");
const sdk = require("@defillama/sdk");
const {
  sumMultiBalanceOf,
  sumSingleBalance
} = require("@defillama/sdk/build/generalUtil");
const { getChainTransform } = require("../helper/portedTokens");
const contracts = require("./contracts.json");
const { default: BigNumber } = require("bignumber.js");

async function tvl(timestamp, block, chainBlocks) {
  const chains = contracts.tokenHolders.map(c => c.chain);
  const response = (await Promise.all(
    contracts.tokenHolders.map(c =>
      axios.get(
        `https://api.covalenthq.com/v1/${contracts.chainMap[c.chain]
          .chainId}/address/${c.address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
      )
    )
  )).map(a => a.data.data.items);

  const balances = {};

  for (let i = 0; i < chains.length; i++) {
    console.log(i);
    const chain = chains[i];
    const transform = await getChainTransform(chain);

    let calls = response[i].map(t => ({
      target: t.contract_address,
      params: [contracts.tokenHolders[i].address]
    }));

    const [gasBalances, erc20Balances] = await Promise.all([
      sdk.api.eth.getBalances({
        targets: calls
          .filter(c => c.target == contracts.chainMap[chains[i]].gasToken)
          .map(c => c.params[0]),
        block: chainBlocks[chain],
        chain
      }),
      sdk.api.abi.multiCall({
        abi: "erc20:balanceOf",
        calls: calls.filter(
          c => c.target != contracts.chainMap[chains[i]].gasToken
        ),
        block: chainBlocks[chain],
        chain
      })
    ]);

    sumMultiBalanceOf(balances, erc20Balances, true, transform);
    sumSingleBalance(
      balances,
      contracts.chainMap[chains[i]].wrappedGasToken,
      gasBalances.output
        .reduce((a, b) => a.plus(new BigNumber(b.balance)), new BigNumber("0"))
        .toFixed(0)
    );
  }

  return balances;
}
// node test.js projects/hector/index.js
module.exports = {
  ethereum: {
    tvl
  }
};
