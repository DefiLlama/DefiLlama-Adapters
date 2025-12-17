const abi = require("./abi.js");
const { getLogs2 } = require('../helper/cache/getLogs');

const vaults = Object.values({
  STREAMUSD_WRAPPER_CONTRACT: "0x6eAf19b2FC24552925dB245F9Ff613157a7dbb4C",
  STREAMBTC_WRAPPER_CONTRACT: "0x05F47d7CbB0F3d7f988E442E8C1401685D2CAbE0",
  STREAMETH_WRAPPER_CONTRACT: "0xF70f54cEFdCd3C8f011865685FF49FB80A386a34",
  STREAMEUR_WRAPPER_CONTRACT: "0xDCFd98A5681722DF0d93fc11b9205f757576a427",
})

const xTokens = Object.values({
  xUSD: "0xE2Fc85BfB48C4cF147921fBE110cf92Ef9f26F94",
  xBTC: "0x12fd502e2052CaFB41eccC5B596023d9978057d6",
  xETH: "0x7E586fBaF3084C0be7aB5C82C04FfD7592723153",
  xEUR: "0xc15697f61170Fc3Bb4e99Eb7913b4C7893F64F13",
})

const StakeEvent = 'event Stake(address indexed account, uint256 amount, uint256 round)';
const UnStakeEvent = 'event Unstake(address indexed account, uint256 amount, uint256 round)';

// this address from team did loop to manipulate tvl, we will remove all deposit from this address
// these wallets deposit some initial USDC, WBTC, ETH on ethereum to mint xUSD, xBTC, xETH
// they bridge xUSD, xBTC, xETH to other chains
// they used xUSD, xBTC, xETH as collateral to borrow USDT, USDC, deUSD
// they use swap all borrowed tokens to USDC, WBTC, ETH, deposit back to xUSD, xBTC, xETH
const FromBlock = 21870476;

const StakeTopics = [
  '0x5af417134f72a9d41143ace85b0a26dce6f550f894f2cbc1eeee8810603d91b6',
  '0x0000000000000000000000001597e4b7cf6d2877a1d690b6088668afdb045763',
];
const UnStakeTopics = [
  '0xf960dbf9e5d0682f7a298ed974e33a28b4464914b7a2bfac12ae419a9afeb280',
  '0x0000000000000000000000001597e4b7cf6d2877a1d690b6088668afdb045763',
];

async function tvl(api) {
  // https://x.com/StreamDefi/status/1985556360507822093
  // bad debts
  if (api.timestamp < 1762214400) {
    const bals = await api.multiCall({  abi: abi.totalSupply, calls: vaults})
    const assets = await api.multiCall({  abi: abi.asset, calls: vaults})
    
    for (let i = 0; i < vaults.length; i++) {
      const totalBalance = Number(bals[i]);
      
      // remove deposit from team wallets
      let teamDeposit = 0;
      const symbol = Object.keys(xTokens)[i];
      const stakeEvents = await getLogs2({ api, target: xTokens[i], fromBlock: FromBlock, eventAbi: StakeEvent, topics: StakeTopics, extraKey: `stream-stake-${api.chain}${symbol}` });
      const unstakeEvents = await getLogs2({ api, target: xTokens[i], fromBlock: FromBlock, eventAbi: UnStakeEvent, topics: UnStakeTopics, extraKey: `stream-unstake-${api.chain}${symbol}` });
      for (const log of stakeEvents) {
        teamDeposit += Number(log.amount);
      }
      for (const log of unstakeEvents) {
        teamDeposit -= Number(log.amount);
      }
      
      const balance = teamDeposit > 0 ? totalBalance - teamDeposit : totalBalance;
      
      api.addToken(assets[i], balance)
    }  
  }
}


module.exports = {
  methodology: "Calculates the TVL of all Stream vaults",
  start: 1739697390,
  hallmarks: [
    [1740283200, "Stream V2 Launch"],
    [1762214400, "Reported loss $93 million users fund"],
  ],
  ethereum: {
    tvl,
  },
};
