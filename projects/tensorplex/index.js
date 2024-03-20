const sdk = require("@defillama/sdk");
const st_tao_contract_address = "0xB60acD2057067DC9ed8c083f5aa227a244044fD6";

async function tvlEthereum(timestamp, ethBlock, chainBlocks, { api }) {
  const total_supply = await sdk.api.erc20.totalSupply({
    target: st_tao_contract_address,
    ethBlock,
  });
  api.addCGToken("tensorplex-staked-tao", parseInt(total_supply.output) / 1e9);
  return api.getBalances();
}

module.exports = {
  methodology: "TVL counts tokens staked by the protocol.",
  ethereum: {
    tvl: tvlEthereum,
  },
};
