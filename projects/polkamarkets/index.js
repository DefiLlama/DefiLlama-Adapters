const sdk = require("@defillama/sdk");

const protocols = [
  {
    chain: "moonriver",
    predictionMarketContractAddress: "0xdcbe79f74c98368141798ea0b7b979b9ba54b026",
    realitioContractAddress: "0x60d7956805ec5a698173def4d0e1ecdefb06cc57",
    polkAddress: "0x8b29344f368b5fa35595325903fe0eaab70c8e1f"
  },
  {
    chain: "moonbeam",
    predictionMarketContractAddress: "0x21DFb0a12D77f4e0D2cF9008d0C2643d1e36DA41",
    realitioContractAddress: "0x83d3f4769a19f1b43337888b0290f5473cf508b2",
    polkAddress: "0x8b29344f368b5fa35595325903fe0eaab70c8e1f"
  },
  {
    chain: "ethereum",
    predictionMarketContractAddress: "0xc24a02d81dee67fd52cc95b0d04172032971ea10",
    realitioContractAddress: "0xfa443f0ec4aed3e87c6d608ecf737a83d950427b",
    polkAddress: "0xd478161c952357f05f0292b56012cd8457f1cfbf"
  }
];

function chainTvl(chain) {
  return async function tvl({timestamp}, ethBlock, chainBlocks) {
    const balances = {};
    const chainProtocols = protocols.filter(protocol => protocol.chain === chain);
    const block = chainBlocks[chain];

    for (const protocol of chainProtocols) {
      const balance = (
        await sdk.api.eth.getBalance({
          target: protocol.predictionMarketContractAddress,
          params: timestamp,
          chain,
          block,
        })
      ).output;

      sdk.util.sumSingleBalance(balances, protocol.chain, Number(balance) / 1e18);
    }

    return balances;
  }
}

function chainStaking(chain) {
  return async function staking(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const chainProtocols = protocols.filter(protocol => protocol.chain === chain);
    const block = chainBlocks[chain];

    for (const protocol of chainProtocols) {
      const polkBalance = (
        await sdk.api.erc20.balanceOf({
          target: protocol.polkAddress,
          owner: protocol.realitioContractAddress,
          params: timestamp,
          chain,
          block,
        })
      ).output;

      sdk.util.sumSingleBalance(
        balances,
        "polkamarkets",
        Number(polkBalance) / 1e18
      );
    }

    return balances;
  }
}

module.exports = {
  methodology:
    "Polkamarkets TVL equals the contracts' EVM balance + bonds contracts' POLK balance.",
  moonriver: {
    tvl: chainTvl('moonriver'),
    staking: chainStaking('moonriver')
  },
  moonbeam: {
    tvl: chainTvl('moonbeam'),
    staking: chainStaking('moonbeam')
  },
  ethereum: {
    tvl: chainTvl('ethereum'),
    staking: chainStaking('ethereum')
  },
};
