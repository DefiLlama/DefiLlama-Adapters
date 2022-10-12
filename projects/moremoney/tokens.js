const { ethers } = require("ethers");

async function getTokenDecimalsAndValue1e18(normalResults) {
  let tokenDecimals = {};
  let tokenValuePer1e18 = {};

  const provider = new ethers.providers.JsonRpcProvider(
    "https://api.avax.network/ext/bc/C/rpc"
  );

  await Promise.all(
    normalResults.map(async (normalResult) => {
      const contract = new ethers.Contract(
        normalResult.token,
        [
          {
            inputs: [],
            name: "decimals",
            outputs: [
              {
                internalType: "uint8",
                name: "",
                type: "uint8",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        provider
      );
      const decimals = await contract.decimals();
      tokenDecimals[normalResult.token] = decimals;
      tokenValuePer1e18[normalResult.token] = normalResult.valuePer1e18;
    })
  );

  return { tokenDecimals, tokenValuePer1e18 };
}
module.exports = {
  getTokenDecimalsAndValue1e18: getTokenDecimalsAndValue1e18,
};
