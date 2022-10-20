const sdk = require("@defillama/sdk");

const predictionBNB = "0x31B8A8Ee92961524fD7839DC438fd631D34b49C6";
const predictionETH = "0xE39A6a119E154252214B369283298CDF5396026B";
const predictionBTC = "0x3Df33217F0f82c99fF3ff448512F22cEf39CC208";

const predictionBTCPOLY = "0xd71b0366CD2f2E90dd1F80A1F0EA540F73Ac0EF6";
const predictionTESLA = "0x3fc376530Ac35d37Dd1Fa794F922e0f30CbB2c46";
const predictionMATIC = "0x59e0aD27d0F58A15128051cAA1D2917aA71AB864";

async function tvlBSC(timestamp, block, chainBlocks) {
  const balances = {};
  const outputBNB = (
    await sdk.api.eth.getBalance({
      target: predictionBNB,
      chain: "bsc",
      block: chainBlocks.bsc,
    })
  ).output;

  const outputETH = (
    await sdk.api.eth.getBalance({
      target: predictionETH,
      chain: "bsc",
      block: chainBlocks.bsc,
    })
  ).output;

  const outputBTC = (
    await sdk.api.eth.getBalance({
      target: predictionBTC,
      chain: "bsc",
      block: chainBlocks.bsc,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    outputBNB
  );

  sdk.util.sumSingleBalance(
    balances,
    "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    outputETH
  );

  sdk.util.sumSingleBalance(
    balances,
    "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    outputBTC
  );
  return balances;
}

async function tvlMATIC(timestamp, block, chainBlocks) {
    const balances = {};
    const outputMATIC = (
      await sdk.api.eth.getBalance({
        target: predictionMATIC,
        chain: "polygon",
        block: chainBlocks.polygon,
      })
    ).output;
  
    const outputTESLA = (
      await sdk.api.eth.getBalance({
        target: predictionTESLA,
        chain: "polygon",
        block: chainBlocks.polygon,
      })
    ).output;
  
    const outputBTC = (
      await sdk.api.eth.getBalance({
        target: predictionBTCPOLY,
        chain: "polygon",
        block: chainBlocks.polygon,
      })
    ).output;
  
    sdk.util.sumSingleBalance(
      balances,
      "polygon:0x0000000000000000000000000000000000001010",
      outputMATIC
    );
  
    sdk.util.sumSingleBalance(
      balances,
      "polygon:0x0000000000000000000000000000000000001010",
      outputTESLA
    );
  
    sdk.util.sumSingleBalance(
      balances,
      "polygon:0x0000000000000000000000000000000000001010",
      outputBTC
    );
    return balances;
  }

module.exports = {
  bsc: {
    tvl: tvlBSC,
  },
  polygon: {
    tvl: tvlMATIC,
  },
};
