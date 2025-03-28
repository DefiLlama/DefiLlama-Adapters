const sdk = require("@defillama/sdk");

const BREAD_CONTRACT_ADDRESS = "0x0003eEDFdd020bf60D10cf684ABAc7C4534B7eAd";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};


  const backing = await sdk.api.abi.call({
    target: BREAD_CONTRACT_ADDRESS,
    abi: "uint256:getBacking",
    chain: "berachain",
    block: chainBlocks.berachain
  });

  // Add the BERA token amount to balances
  sdk.util.sumSingleBalance(
    balances,
    "berachain:0x0000000000000000000000000000000000000000",
    backing.output
  );

  return balances;
}

module.exports = {
  methodology: "Calculated by calling the getBacking function on the contract and converting to USD using the BERA token price",
  berachain: {tvl}
};