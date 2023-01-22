const sdk = require("@defillama/sdk");
const { ethereumContractData, polygonContractData, avaxContractData, bscContractData, kavaContractData } = require("./config");
const { vestingHelper } = require("../helper/unknownTokens");

function getTvl(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let totalBalances = {}
    for (let i = 0; i < args.length; i++) {

      const contractAddress = args[i].contract
      const abi = args[i].contractABI
      const chain = args[i].chain
      const block = chainBlocks[chain]
      const trackedTokens = args[i].trackedTokens
      const totalDepositId = Number(
        (
          await sdk.api.abi.call({
            abi: abi.depositId,
            target: contractAddress,
            chain: chain,
            block: block
          })
        ).output
      );

      let lockedLPs = [];
      const allDepositId = Array.from(Array(totalDepositId).keys());
      const lpAllTokens = (
        await sdk.api.abi.multiCall({
          abi: abi.getDepositDetails,
          calls: allDepositId.map((num) => ({
            target: contractAddress,
            params: num,
          })),
          chain: chain,
          block: block
        })
      ).output

      lpAllTokens.forEach(lp => {
        if (!lp.success) return;
        const lpToken = lp.output[0].toLowerCase()
        lockedLPs.push(lpToken)
      })

      const balances = await vestingHelper({
        useDefaultCoreAssets: true,
        owner: contractAddress,
        tokens: lockedLPs,
        block, chain,
        blacklist: args[i].blacklist,
      })

      for (const [token, balance] of Object.entries(balances))
        sdk.util.sumSingleBalance(totalBalances, token, balance)
    }
    return totalBalances
  }
}

module.exports = {
  methodology: `Counts each LP pair's native token and 
  stable balance, adjusted to reflect locked pair's value. 
  Balances and merged across multiple locker to return sum TVL per chain`,
  ethereum: {
    tvl: getTvl(ethereumContractData),
  },
  bsc: {
    tvl: getTvl(bscContractData),
  },
  polygon: {
    tvl: getTvl(polygonContractData),
  },
  avax: {
    tvl: getTvl(avaxContractData),
  },
  kava: {
    tvl: getTvl(kavaContractData)
  }
};

