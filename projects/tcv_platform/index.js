

const { sumTokens2 } = require('../helper/unwrapLPs');


async function tvl(api) {
  const tcvFactory = "0xCa2396933E02Fb7636126a914aE5f5512ab31077";
  const index = await api.call({
    target: tcvFactory,
    abi: {
        inputs: [],
        name: "numVaults",
        outputs: [
            {
                "internalType": "uint256",
                "name": "result",
                "type": "uint256"
            }
        ],
        stateMutability:"view",
        "type": "function"
    },
   
  });
  console.log("i",index)

  const vaults = await api.call({
    target: tcvFactory,
    abi: {
      inputs: [
        { internalType: "uint256", name: "startIndex_", type: "uint256" },
        { internalType: "uint256", name: "endIndex_", type: "uint256" },
      ],
      name: "vaults",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
    },
    params: ["0", String(index)],
  });
  await sumTokens2({ api, resolveUniV3: true, owners: vaults })
}
module.exports = {
  methodology: "Calculates total liquidity from all NFT ranges in the given pools.",
  start: 1717239410,
  arbitrum: {
    tvl,

  },
};