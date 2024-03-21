const { getUniTVL } = require('../helper/unknownTokens');
const tvl = getUniTVL({
  fetchBalances: true,
  useDefaultCoreAssets: true,
  factory: '0x54E3c605f52B6f297fca5afFC6B9a221fFd65ec2',
})

module.exports = {
  methodology: `Uses factory(0x54E3c605f52B6f297fca5afFC6B9a221fFd65ec2) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  misrepresentedTokens: true,
  scroll: { tvl, }
  
};
