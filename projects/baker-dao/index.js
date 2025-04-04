const sdk = require("@defillama/sdk");

const BREAD_CONTRACT_ADDRESS = "0x0003eEDFdd020bf60D10cf684ABAc7C4534B7eAd";
const BERA_ADDRESS = "0x0000000000000000000000000000000000000000"; // Native token

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  // Get BERA balance of the BREAD contract
  const beraBalance = await sdk.api.eth.getBalance({
    target: BREAD_CONTRACT_ADDRESS,
    chain: "berachain",
    block: chainBlocks.berachain
  });

  // Get BREAD token balance (in contract)
  const breadBalance = await sdk.api.erc20.balanceOf({
    target: BREAD_CONTRACT_ADDRESS, // BREAD is its own token
    owner: BREAD_CONTRACT_ADDRESS,  // Checking balance held by the contract itself
    chain: "berachain",
    block: chainBlocks.berachain
  });

  // Get the prevPrice from the contract
  const prevPrice = await sdk.api.abi.call({
    target: BREAD_CONTRACT_ADDRESS,
    abi: "uint256:prevPrice",
    chain: "berachain",
    block: chainBlocks.berachain
  });

  // Calculate TVL using the new formula:
  // bera in contract * bera price + bread in contract * prevPrice * bera price
  const beraTvl = Number(beraBalance.output);
  const breadTvl = Number(breadBalance.output) * Number(prevPrice.output / 1e18);
  const totalTvl = beraTvl + breadTvl;

  // Add the calculated value to balances
  sdk.util.sumSingleBalance(
    balances,
    `berachain:${BERA_ADDRESS}`,
    totalTvl
  );

  return balances;
}

module.exports = {
  methodology: "Calculated based on the formula: (BERA in contract * BERA price) + (BREAD in contract * prevPrice * BERA price)",
  berachain: {tvl}
};