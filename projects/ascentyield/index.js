const { getLogs2 } = require('../helper/cache/getLogs')

const hedgeMinter = '0x1f05c0532c8fa1658bc90e9c0f16ef9d98329d4f'
const jlpMinter = '0xa6Ff9a77D6bD8B0a759055Cd8885e23228bc10Ec'

const eventAbi = {
  mint: 'event Mint(address indexed minter, address indexed benefactor, address indexed beneficiary, address collateral_asset, uint256 collateral_amount, uint256 hedgeplus_amount)',
  redeemSettle: 'event RedeemSettle(address indexed redeemer, address collateral_asset, uint256 collateral_amount, uint256 hedgeplus_amount)',
}

const tvl = async (api) => {
  const hedgePlusMints = await getLogs2({ extraKey: 'ascent-hedgeMint', api, target: hedgeMinter, eventAbi: eventAbi.mint, fromBlock: 271494400 })
  const hedgePlusRedeems = await getLogs2({ extraKey: 'ascent-hedgeRedeem', api, target: hedgeMinter, eventAbi: eventAbi.redeemSettle, fromBlock: 271494400 })
  const jlpPlusMints = await getLogs2({ extraKey: 'ascent-jlpMint', api, target: jlpMinter, eventAbi: eventAbi.mint, fromBlock: 258855781 })
  const jlpPlusRedeems = await getLogs2({ extraKey: 'ascent-jlpRedeem', api, target: jlpMinter, eventAbi: eventAbi.redeemSettle, fromBlock: 258855781 })

  const parseLogs = (logs, mints, redeems) => {
    return logs.reduce((acc, log) => {
      let collateral_asset, collateral_amount;

      if (mints.includes(log)) {
        [, , , collateral_asset, collateral_amount] = log;
        collateral_amount = Number(collateral_amount);
      } 
      if (redeems.includes(log)) {
        [, collateral_asset, collateral_amount] = log;
        collateral_amount = -Number(collateral_amount);
      }

      if (!acc[collateral_asset]) {
        acc[collateral_asset] = { asset: collateral_asset, balance: 0 };
      }

      acc[collateral_asset].balance += collateral_amount;
      return acc;
    }, {});
  };

  const hedgeBalances = parseLogs([...hedgePlusMints, ...hedgePlusRedeems], hedgePlusMints, hedgePlusRedeems);
  const jlpBalances = parseLogs([...jlpPlusMints, ...jlpPlusRedeems], jlpPlusMints, jlpPlusRedeems);

  Object.values(hedgeBalances).forEach(({ asset, balance }) => api.add(asset, balance));
  Object.values(jlpBalances).forEach(({ asset, balance }) => api.add(asset, balance));
}

module.exports = {
  arbitrum: { tvl }
}