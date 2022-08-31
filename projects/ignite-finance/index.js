const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require("../helper/balances");
const chain = 'klaytn'

const TINDER_ADDRESS = "0x7cd4a64946e91989a21548362c18052704fe5ed6";
const TREASURY = "0xd5EFfEC94D1E0E099277C3723Eb8cc9343738fb5"
const BOND_DATA = {
  NAME: "KDAI_TINDER_LP",
  TOKEN: "0x14E180985BC510628F36a4A129FB57A5Fcb2eE33",
  BOND: "0x68a1C029523D60237d1eAe81777d87E49de4E27F",
  TYPE: "LP",
};

async function getBondMarketPrice(block) {
  const reserves = (await sdk.api.abi.call({ target: BOND_DATA.TOKEN, abi: abi.getCurrentPool, chain, block })).output;
  return new BigNumber(reserves[0])
    .div(reserves[1])
    .div(10 ** 9)
    .toFixed(5);
}

async function staking(ts, _block, chainBlocks) {
  const block = chainBlocks[chain]
  const sTINDERCirculatingSupply = (await sdk.api.erc20.balanceOf({ target: TINDER_ADDRESS, owner: TREASURY, block, chain })).output
  const  marketPrice = await getBondMarketPrice(block)

  return toUSDTBalances(
    (sTINDERCirculatingSupply * marketPrice) / 10 ** 9
  );
}

module.exports = {
  misrepresentedTokens: true,
  klaytn: {
    tvl: async () => ({}),
    staking,
  },
  methodology: "Counts tokens on the staking for tvl",
};
