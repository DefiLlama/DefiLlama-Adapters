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

  sdk.util.sumSingleBalance(
    balances,
    `berachain:${BERA_ADDRESS}`,
    beraBalance.output
  );

  sdk.util.sumSingleBalance(
    balances,
    `berachain:${BREAD_CONTRACT_ADDRESS}`,
    breadBalance.output
  );

  return balances;
}

module.exports = {
  methodology: "Measures the total value of BERA and BREAD tokens held in the protocol's contract",
  berachain: {tvl}
};