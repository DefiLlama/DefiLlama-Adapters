const sdk = require('@defillama/sdk');
const TOKEN_CONTRACT_ADDRESS = "0x829363736a5A9080e05549Db6d1271f070a7e224";
const OWNER_ADDRESS = "0x829363736a5A9080e05549Db6d1271f070a7e224";

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const totalSupplyBigInt = await api.call({
    abi: "erc20:totalSupply",
    target: TOKEN_CONTRACT_ADDRESS,
  });

  const supplyDecimals = await api.call({
    abi: {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    target: TOKEN_CONTRACT_ADDRESS,
  });

  const totalSupply = Number(totalSupplyBigInt) / 10 ** supplyDecimals;

  const { num, decimals } = await api.call({
    abi: {
      constant: true,
      inputs: [],
      name: "detailedPrice",
      outputs: [
        { internalType: "uint256", name: "num", type: "uint256" },
        { internalType: "uint8", name: "decimals", type: "uint8" },
      ],
      stateMutability: "view",
      type: "function",
    },
    target: TOKEN_CONTRACT_ADDRESS,
  });

  const tokenPriceInUSD = num / (10 ** decimals);
  balances["usd"] = tokenPriceInUSD * totalSupply;
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'The TVL is calculated by fetching the total supply of the token from the contract,' +
    ' retrieving the tokens price in USD using the contracts "detailedPrice" function,' +
    ' and then multiplying the total supply by the tokens price',
  start: 1000235,
  polygon: {
    tvl,
  }
};
