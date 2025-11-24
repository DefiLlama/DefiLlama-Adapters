const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json');

const abi = [
  {
    type: "function",
    name: "getDepositData",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct HubAssetPoolState.DepositData",
        components: [
          {
            name: "optimalUtilisationRatio",
            type: "uint16",
            internalType: "uint16",
          },
          { name: "totalAmount", type: "uint256", internalType: "uint256" },
          {
            name: "interestRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "interestIndex",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
];

async function monTvl(timestamp, ethBlock, { monad: block }) {
  const chain = "monad";
  const pooledMON = await sdk.api.abi.call({
    abi,
    target:"0x106d0e2bff74b39d09636bdcd5d4189f24d91433",
   // block,
    chain
  });

  const pooledUSDC = await sdk.api.abi.call({
    abi,
    target:"0xdb4e67f878289a820046f46f6304fd6ee1449281",
    //block,
    chain
  });

  const pooledWMON = await sdk.api.abi.call({
    abi,
    target:"0xf358f9e4ba7d210fde8c9a30522bb0063e15c4bb",
    //block,
    chain
  });

  return {
    [ADDRESSES.null]: pooledMON.output.totalAmount,
    ["0x754704Bc059F8C67012fEd69BC8A327a5aafb603"]: pooledUSDC.output.totalAmount,
    ["0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A"]: pooledWMON.output.totalAmount
  }
  
}


module.exports = {
    methodology:"Counts the total amount deposited in all pools",
    monad: {
        tvl: monTvl
    }
}