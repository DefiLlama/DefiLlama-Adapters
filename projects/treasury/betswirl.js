const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const banks = {
  bsc: [
    [18371153, 1, "0xC7130b9D454243BE816B7f5Ab09E7eF292b0c465"],
    [21181038, 2, "0xF26E41e3714eFe1ff03b423f45DCc31a98C21867"],
    [23111708, 3, "0x2A555e3AD89571b931FF6c7b8B7E655D62dbC9F8"],
    [Infinity, 4, "0xa475f643aa480a3df3e9872b6e80e75ae99b19db"],
  ],
  polygon: [
    [29120547, 1, "0x72A5b0295EAaCC8c005Ec6a800cB9BECEd73DA0E"],
    [32887029, 2, "0x1a54574CBAe9f8a4f9dd19d56687F2266d0C9d31"],
    [35722686, 3, "0x2528401607cc0590d31c2fCA129a75dc13b1dbB7"],
    [Infinity, 4, "0x999B6D28A9e78C4bE13D51469c49585D6D25be5E"],
  ],
  avax: [
    [19707470, 2, "0x187De399100aA962F209Aa78621F5138ACA6111f"],
    [Infinity, 3, "0x908A71B19B25f3c7Cdc7597136d8f4AC068d4971"],
  ],
};

function treasury(chain) {
  return async (api) => {
    const abiV1 = 'function getTokens() view returns (tuple(uint8 decimals, address tokenAddress, string name, string symbol, tuple(bool allowed, tuple(uint16 dividend, uint16 referral, uint16 treasury, uint16 team, uint256 dividendAmount, uint256 treasuryAmount, uint256 teamAmount) houseEdgeSplit, uint256 balanceReference, tuple(uint16 thresholdRate, uint16 toTreasury, uint16 toTeam) balanceOverflow) token)[])'
    const abiV2 = 'function getTokens() view returns (tuple(uint8 decimals, address tokenAddress, string name, string symbol, tuple(bool allowed, uint16 balanceRisk, address partner, tuple(uint16 dividend, uint16 referral, uint16 partner, uint16 treasury, uint16 team, uint256 dividendAmount, uint256 partnerAmount, uint256 treasuryAmount, uint256 teamAmount, uint256 referralAmount, uint256 minPartnerTransferAmount) houseEdgeSplit, uint256 balanceReference, tuple(uint16 thresholdRate, uint16 toTreasury, uint16 toTeam) balanceOverflow) token)[])'
    const currentAbi = 'function getTokens() view returns (tuple(uint8 decimals, address tokenAddress, string name, string symbol, tuple(bool allowed, bool paused, uint16 balanceRisk, uint64 VRFSubId, address partner, uint256 minBetAmount, uint256 minPartnerTransferAmount, tuple(uint16 bank, uint16 dividend, uint16 partner, uint16 treasury, uint16 team, uint256 dividendAmount, uint256 partnerAmount, uint256 treasuryAmount, uint256 teamAmount) houseEdgeSplit) token)[])'

    const ownerTokens = []
    // Some tokens are still on the old contracts.
    let oldBankAddress
    let abi
    if (chain === 'polygon') {
      [, , oldBankAddress] = banks.polygon[1]
      abi = abiV2
    } else if (chain === 'bsc') {
      [, , oldBankAddress] = banks.bsc[2]
      abi = currentAbi
    }
    if (oldBankAddress) {
      const tokens = await api.call({
        target: oldBankAddress,
        abi,
      });
      ownerTokens.push([tokens.map(i => i.tokenAddress), oldBankAddress])
    }

    // Get the Bank for the input block
    const [, bankVersion, bankAddressOfBlock] = banks[chain].find(
      ([bankLastBlock]) => (api.block || 999999999999) < bankLastBlock
    );

    // Retrieves all tokens from the Bank contract
    if (bankVersion === 1) {
      abi = abiV1
    } else if (bankVersion === 2) {
      abi = abiV2
    } else {
      abi = currentAbi
    }
    const tokens = await api.call({
      target: bankAddressOfBlock,
      abi,
    });

    // Filter BetSwirl's governance token
    const tokensWithoutBETS = tokens.filter((token) => token.symbol !== "BETS").map(i => i.tokenAddress)
    ownerTokens.push([tokensWithoutBETS, bankAddressOfBlock])
    return sumTokens2({ ownerTokens, api, })
  };
}

module.exports = {
  methodology:
    "BetSwirl has no users TVL yet. However, it includes the bankrolls amounts (each tokens amount in the bank allowing players to bet).",
  // The first Bank was deployed on Polygon at tx 0x6b99f617946d2f8c23adcd440cd3309d2da750e52d135853f38a0da11cdc3233
  start: 1648344312, // new Date(Date.UTC(2022, 2, 27, 1, 25, 12)).getTime() / 1e3,
  bsc: {
    tvl: treasury("bsc"),
    ownTokens: staking('0xa475f643aa480a3df3e9872b6e80e75ae99b19db', '0x3e0a7C7dB7bB21bDA290A80c9811DE6d47781671'),
  },
  polygon: {
    tvl: treasury("polygon"),
    ownTokens: staking('0x999B6D28A9e78C4bE13D51469c49585D6D25be5E', '0x9246a5f10a79a5a939b0c2a75a3ad196aafdb43b'),
  },
  avax:{
    tvl: treasury("avax"),
    ownTokens: staking('0x908A71B19B25f3c7Cdc7597136d8f4AC068d4971', '0xc763f8570A48c4c00C80B76107cbE744dDa67b79'),
  },
};
