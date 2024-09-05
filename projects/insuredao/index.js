const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokensAndLPs, } = require('../helper/unwrapLPs');

// addresses pools

const usdc = ADDRESSES.ethereum.USDC;
const insure = "0xd83AE04c9eD29d6D3E6Bf720C71bc7BeB424393E";

const VotingEscrow = "0x3dc07E60ecB3d064d20c386217ceeF8e3905916b";
const vlINSURE = "0xA12ab76a82D118e33682AcB242180B4cc0d19E29";

const uni = "0x1b459aec393d604ae6468ae3f7d7422efa2af1ca";
const uniStaking = "0xf57882cf186db61691873d33e3511a40c3c7e4da";

// =================== GET INSURE BALANCES =================== //
async function staking(_, block) {
  let balances = {};

  const veinsureBalances = (
    await sdk.api.abi.call({
      target: VotingEscrow,
      abi: 'uint256:supply',
      block: block,
    })
  ).output;

  const vlinsureBalances = (
    await sdk.api.abi.call({
      target: insure,
      params: vlINSURE,
      abi: 'erc20:balanceOf',
      block: block,
    })
  ).output;
  
  sdk.util.sumSingleBalance(balances, insure ,veinsureBalances);
  sdk.util.sumSingleBalance(balances, insure ,vlinsureBalances);
  
  return balances;
}

async function pool2(_, block) {
  const balances = {}
  await sumTokensAndLPs(balances, [
    [uni, uniStaking, true]
  ], block)
  return balances
}

const config = {
  ethereum: '0x131fb74c6fede6d6710ff224e07ce0ed8123f144',
  arbitrum: '0x968C9718f420d5D4275C610C5c217598a6ade9f9',
  optimism: '0x54F23d2fdC1E17D349B1Eb14d869fa4deD6A6D2b',
  astar: '0x190dA1B9fA124BD872e9166bA3c7Dd656A11E8F8',
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const bal = await api.call({
        target: vault,
        abi: 'uint256:valueAll',
      })
      return { [usdc]: bal}
    }
  }
})

module.exports.ethereum.staking = staking
module.exports.ethereum.pool2 = pool2
