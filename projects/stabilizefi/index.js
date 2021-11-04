const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json")

const AVAX_ADDRESS = 'avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
const ETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const BTC_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

const AVAX_TROVE_MANAGER_ADDRESS = "0x7551A127C41C85E1412EfE263Cadb49900b0668C";
const ETH_TROVE_MANAGER_ADDRESS = "0x7837C2dB2d004eB10E608d95B2Efe8cb57fd40b4";
const BTC_TROVE_MANAGER_ADDRESS = "0x56c194F1fB30F8cdd49E7351fC9C67d8C762a86F";

async function tvl(_, _ethBlock, chainBlocks) {
  const AVAXBalance = (
    await sdk.api.abi.call({
      target: AVAX_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const ETHBalance = (
    await sdk.api.abi.call({
      target: ETH_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const BTCBalance = (
    await sdk.api.abi.call({
      target: BTC_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  return { [AVAX_ADDRESS]: AVAXBalance, [ETH_ADDRESS]: ETHBalance, [BTC_ADDRESS]: BTCBalance};
}

module.exports = {
  tvl,
};
