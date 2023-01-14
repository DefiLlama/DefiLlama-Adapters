const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')

const banks = {
  bsc: [
    [18371153, "0xC7130b9D454243BE816B7f5Ab09E7eF292b0c465"],
    [Infinity, "0xF26E41e3714eFe1ff03b423f45DCc31a98C21867"],
  ],
  polygon: [
    [29120547, "0x72A5b0295EAaCC8c005Ec6a800cB9BECEd73DA0E"],
    [Infinity, "0x1a54574CBAe9f8a4f9dd19d56687F2266d0C9d31"],
  ],
  avax: [[Infinity, "0x187De399100aA962F209Aa78621F5138ACA6111f"]],
};

function treasury(chain) {
  return async (_timestamp, _block, {[chain]: block}) => {
    // Get the Bank for the input block
    const [, bankAddressOfBlock] = banks[chain].find(
      ([bankLastBlock]) => (block || 999999999999) < bankLastBlock
    );

    // Retrieves all tokens from the Bank contract
    const { output: tokens } = await sdk.api.abi.call({
      target: bankAddressOfBlock,
      abi: 'function getTokens() view returns (tuple(uint8 decimals, address tokenAddress, string name, string symbol, tuple(bool allowed, uint16 balanceRisk, address partner, tuple(uint16 dividend, uint16 referral, uint16 partner, uint16 treasury, uint16 team, uint256 dividendAmount, uint256 partnerAmount, uint256 treasuryAmount, uint256 teamAmount, uint256 referralAmount, uint256 minPartnerTransferAmount) houseEdgeSplit, uint256 balanceReference, tuple(uint16 thresholdRate, uint16 toTreasury, uint16 toTeam) balanceOverflow) token)[])',
      block,
      chain,
    });

    // Filter BetSwirl's governance token
    const tokensWithoutBETS = tokens.filter((token) => token.symbol !== "BETS").map(i => i.tokenAddress)
    return sumTokens2({ owner: bankAddressOfBlock, tokens: tokensWithoutBETS, chain, block, })
  };
}

module.exports = {
  timetravel: true,
  methodology:
    "BetSwirl has no users TVL yet. However, it includes the bankrolls amounts (each tokens amount in the bank allowing players to bet).",
  // The first Bank was deployed on Polygon at tx 0x6b99f617946d2f8c23adcd440cd3309d2da750e52d135853f38a0da11cdc3233
  start: 1648344312, // new Date(Date.UTC(2022, 2, 27, 1, 25, 12)).getTime() / 1e3,
  bsc: {
    treasury: treasury("bsc"),
    tvl: () => ({}),
  },
  polygon: {
    treasury: treasury("polygon"),
  },
  avax:{
    treasury: treasury("avax"),
  },
};
