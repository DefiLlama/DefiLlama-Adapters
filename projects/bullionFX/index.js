const ethers = require("ethers");
const bullFactoryABI = require("./abis/bull_factory.json");
const pairABI = require("./abis/pair.json");
const erc20ABI = require("./abis/erc20.json");

const FACTORY_CONTRACT_ADDRESS = "0x5E7CfE3DB397d3DF3F516d79a072F4C2ae5f39bb";
const INFURA_URL =
  "https://mainnet.infura.io/v3/80ba3747876843469bf0c36d0a355f71";

const provider = new ethers.providers.getDefaultProvider(INFURA_URL);

function protocolTvl() {
  return async (timestamp, block, chainBlocks, { api }) => {
    const contract = new ethers.Contract(
      FACTORY_CONTRACT_ADDRESS,
      bullFactoryABI,
      provider
    );

    const allPairs = await contract.allPairsLength();
    const pairContractsReserves = [];

    for (let i = 0; i < allPairs.toNumber(); i++) {
      const pairAddress = await contract.allPairs(i);

      const pair = new ethers.Contract(pairAddress, pairABI, provider);

      const [reserves, token0Address, token1Address] = await Promise.all([
        pair.getReserves(),
        pair.token0(),
        pair.token1(),
      ]);

      const token0 = new ethers.Contract(token0Address, erc20ABI, provider);
      const token1 = new ethers.Contract(token1Address, erc20ABI, provider);

      const [token0Name, token1Name, token0Decimals, token1Decimals] =
        await Promise.all([
          token0.symbol(),
          token1.symbol(),
          token0.decimals(),
          token1.decimals(),
        ]);

      const reserve0 = reserves[0].toString() / Math.pow(10, token0Decimals);
      const reserve1 = reserves[1].toString() / Math.pow(10, token1Decimals);

      const poolName = token0Name + "/" + token1Name;

      pairContractsReserves.push({
        reserve0,
        reserve1,
        token0Address,
        token1Address,
        token0Name,
        token1Name,
        poolName,
        token0Decimals,
        token1Decimals,
      });
    }

    const dollarPair = pairContractsReserves.map((pairContract) => {
      const dollarWorth = (() => {
        if (pairContract.token0Name.toLowerCase() === "usdc") {
          return pairContract.reserve0 * 2;
        } else if (pairContract.token1Name.toLowerCase() === "usdc") {
          return pairContract.reserve1 * 2;
        } else {
          const usdcPair = pairContractsReserves.find(
            (pair) =>
              (pair.token0Address === pairContract.token0Address ||
                pair.token1Address === pairContract.token0Address) &&
              pair.poolName.includes(usdc)
          );

          const usdcRate =
            usdcPair?.token0Name.toLowerCase() === "usdc"
              ? usdcPair?.reserve0
              : usdcPair?.reserve1;

          return usdcRate * 2;
        }
      })();

      return { ...pairContract, dollarWorth };
    });

    const tvl = dollarPair.reduce((acc, cur) => {
      return acc + cur.dollarWorth;
    }, 0);

    return tvl;
  };
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: protocolTvl(),
  },
};
