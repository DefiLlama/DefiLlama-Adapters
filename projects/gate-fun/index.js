const sdk = require("@defillama/sdk");

const GATEFUN_CONTRACT= "0x7C8FbD15E4c8B722920C1570A4704622D5391113";

async function tvl(api) {
  const { output: balance } = await sdk.api2.eth.getBalance({ target: GATEFUN_CONTRACT, ...api })
  api.addGasToken(balance)
}

module.exports = {
  methodology: 'counts the number of GT in the GateFun contract.',
  gatelayer: {
    tvl,
  }
};
