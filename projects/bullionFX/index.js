const ethers = require("ethers");
const bullFactoryABI = require("./abis/bull_factory.json");
const pairABI = require("./abis/pair.json");
const erc20ABI = require("./abis/erc20.json");

const FACTORY_CONTRACT_ADDRESS = "0x5E7CfE3DB397d3DF3F516d79a072F4C2ae5f39bb";
const INFURA_URL =
  "https://mainnet.infura.io/v3/80ba3747876843469bf0c36d0a355f71";

const provider = new ethers.providers.getDefaultProvider(INFURA_URL);

async function tvl() {
  const contract = new ethers.Contract(
    FACTORY_CONTRACT_ADDRESS,
    bullFactoryABI,
    provider
  );

  const allPairs = await contract.allPairsLength();

  const balances = {};

  for (let i = 0; i < allPairs.toNumber(); i++) {
    const pairAddress = await contract.allPairs(i);

    const pair = new ethers.Contract(pairAddress, pairABI, provider);

    const [reserves, token0Address, token1Address] = await Promise.all([
      pair.getReserves(),
      pair.token0(),
      pair.token1(),
    ]);

    console.log(balances);

    balances[token0Address] = reserves[0].toString();
    balances[token1Address] = reserves[1].toString();
  }

  console.log("balances", balances);

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl,
  },
  timetravel: false,
};
