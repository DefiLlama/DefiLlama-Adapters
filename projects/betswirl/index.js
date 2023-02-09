const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')

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
  return async (_timestamp, _block, {[chain]: block}) => {
    const balances = {}

    const abiV1 = 'function getTokens() view returns (tuple(uint8 decimals, address tokenAddress, string name, string symbol, tuple(bool allowed, tuple(uint16 dividend, uint16 referral, uint16 treasury, uint16 team, uint256 dividendAmount, uint256 treasuryAmount, uint256 teamAmount) houseEdgeSplit, uint256 balanceReference, tuple(uint16 thresholdRate, uint16 toTreasury, uint16 toTeam) balanceOverflow) token)[])'
    const abiV2 = 'function getTokens() view returns (tuple(uint8 decimals, address tokenAddress, string name, string symbol, tuple(bool allowed, uint16 balanceRisk, address partner, tuple(uint16 dividend, uint16 referral, uint16 partner, uint16 treasury, uint16 team, uint256 dividendAmount, uint256 partnerAmount, uint256 treasuryAmount, uint256 teamAmount, uint256 referralAmount, uint256 minPartnerTransferAmount) houseEdgeSplit, uint256 balanceReference, tuple(uint16 thresholdRate, uint16 toTreasury, uint16 toTeam) balanceOverflow) token)[])'
    const currentAbi = 'function getTokens() view returns (tuple(uint8 decimals, address tokenAddress, string name, string symbol, tuple(bool allowed, bool paused, uint16 balanceRisk, uint64 VRFSubId, address partner, uint256 minBetAmount, uint256 minPartnerTransferAmount, tuple(uint16 bank, uint16 dividend, uint16 partner, uint16 treasury, uint16 team, uint256 dividendAmount, uint256 partnerAmount, uint256 treasuryAmount, uint256 teamAmount) houseEdgeSplit) token)[])'

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
      const { output: tokens } = await sdk.api.abi.call({
        target: oldBankAddress,
        abi,
        block,
        chain,
      });
      await sumTokens2({ balances, owner: oldBankAddress, tokens: tokens.map(i => i.tokenAddress), chain, block, })
    }

    // Get the Bank for the input block
    const [, bankVersion, bankAddressOfBlock] = banks[chain].find(
      ([bankLastBlock]) => (block || 999999999999) < bankLastBlock
    );

    // Retrieves all tokens from the Bank contract
    if (bankVersion === 1) {
      abi = abiV1
    } else if (bankVersion === 2) {
      abi = abiV2
    } else {
      abi = currentAbi
    }
    const { output: tokens } = await sdk.api.abi.call({
      target: bankAddressOfBlock,
      abi,
      block,
      chain,
    });

    // Filter BetSwirl's governance token
    const tokensWithoutBETS = tokens.filter((token) => token.symbol !== "BETS").map(i => i.tokenAddress)
    await sumTokens2({ balances, owner: bankAddressOfBlock, tokens: tokensWithoutBETS, chain, block, })
    return balances
  };
}

module.exports = {
  timetravel: true,
  methodology:
    "BetSwirl has no users TVL yet. However, it includes the bankrolls amounts (each tokens amount in the bank allowing players to bet).",
  // The first Bank was deployed on Polygon at tx 0x6b99f617946d2f8c23adcd440cd3309d2da750e52d135853f38a0da11cdc3233
  start: 1648344312, // new Date(Date.UTC(2022, 2, 27, 1, 25, 12)).getTime() / 1e3,
  hallmarks: [
    // Polygon
    [1645970923, "BetSwirl deposit: 2.6k MATIC"],
    [1645976015, "BetSwirl deposit: 1.1k MATIC"],
    [1646136632, "BetSwirl deposit: 1.3k MATIC"],
    [1647366653, "BetSwirl deposit: 544m BETS"],
    [1647445756, "BetSwirl deposit: 7.2k MATIC"],
    [1655245802, "Sphere deposit: 1.3m SPHERE"],
    // [31115990, "BetSwirl deposit: 9k MATIC"], // Transfer to v2
    // [32898892, "BetSwirl deposit: 16.6k MATIC"], // Transfer to v3
    // [32898952, "BetSwirl deposit: 554m BETS"], // Transfer to v3
    // [35726240, "BetSwirl deposit: 556m BETS"], // Transfer to v4
    // [35726240, "BetSwirl deposit: 20.3k MATIC"], // Transfer to v4
    [1669205490, "BetSwirl deposit: 5 wETH"],
    [1669330628, "Jarvis deposit: 106k jMXN"],
    [1669330780, "Jarvis deposit: 5.3k jEUR"],
    [1675356553, "Jarvis deposit: 15.7k jEUR"],
    [1675420032, "BetSwirl deposit: 21k MATIC"],
    [1675815093, "BetSwirl deposit: 777M PolyDoge"],

    // BNB
    [1649191463, "BetSwirl deposit: 10 BNB"],
    [1649616314, "BetSwirl deposit: 75m BETS"],
    [1652807622, "BetSwirl deposit: 29 BNB"],
    [1652808633, "BetSwirl deposit: 75m BETS"],
    [1654293017, "Titano deposit: 40m TITANO"],
    [1655707329, "BetSwirl deposit: 51m BETS"], // to check
    [1659023680, "BetSwirl deposit: 15 BNB"],
    // [21190276, "BetSwirl deposit: 49 BNB"], // Transfer to v3
    // [21190300, "BetSwirl deposit: 197m BETS"], // Transfer to v3
    // [21526500, "Titano deposit: 240m TITANO"], // Transfer to v3
    // [23129957, "BetSwirl deposit: 57 BNB"], // Transfer to v4
    // [23129957, "BetSwirl deposit: 199m BETS"], // Transfer to v4
    [1670448025, "MDB deposit: 3m MDB"],
    [1670448049, "MDB deposit: 15.5k MDB+"],

    // Avalanche
    [1655506365, "BetSwirl deposit: 350 AVAX"],
    [1655506474, "BetSwirl deposit: 23m BETS"],
    [1655519330, "BetSwirl deposit: 127m BETS"],
    [1655707066, "BetSwirl deposit: 50m BETS"],
    // [19714942, "BetSwirl deposit: 395 AVAX"], // Transfer to v3
    [1662768298, "ThorFi deposit: 27k THOR"],
    // [19714974, "BetSwirl deposit: 200m BETS"], // Transfer to v3
  ],
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
