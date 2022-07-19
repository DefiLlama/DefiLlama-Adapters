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
  return async (_timestamp, _block, chainBlocks) => {
    const block = chainBlocks[chain];

    // Get the Bank for the input block
    const [, bankAddressOfBlock] = banks[chain].find(
      ([bankLastBlock]) => block < bankLastBlock
    );

    // Retrieves all tokens from the Bank contract
    const { output: tokens } = await sdk.api.abi.call({
      target: bankAddressOfBlock,
      abi: {
        inputs: [],
        name: "getTokens",
        outputs: [
          {
            components: [
              {
                internalType: "uint8",
                name: "decimals",
                type: "uint8",
              },
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "string",
                name: "symbol",
                type: "string",
              },
              {
                components: [
                  {
                    internalType: "bool",
                    name: "allowed",
                    type: "bool",
                  },
                  {
                    internalType: "uint16",
                    name: "balanceRisk",
                    type: "uint16",
                  },
                  {
                    internalType: "address",
                    name: "partner",
                    type: "address",
                  },
                  {
                    components: [
                      {
                        internalType: "uint16",
                        name: "dividend",
                        type: "uint16",
                      },
                      {
                        internalType: "uint16",
                        name: "referral",
                        type: "uint16",
                      },
                      {
                        internalType: "uint16",
                        name: "partner",
                        type: "uint16",
                      },
                      {
                        internalType: "uint16",
                        name: "treasury",
                        type: "uint16",
                      },
                      {
                        internalType: "uint16",
                        name: "team",
                        type: "uint16",
                      },
                      {
                        internalType: "uint256",
                        name: "dividendAmount",
                        type: "uint256",
                      },
                      {
                        internalType: "uint256",
                        name: "partnerAmount",
                        type: "uint256",
                      },
                      {
                        internalType: "uint256",
                        name: "treasuryAmount",
                        type: "uint256",
                      },
                      {
                        internalType: "uint256",
                        name: "teamAmount",
                        type: "uint256",
                      },
                      {
                        internalType: "uint256",
                        name: "referralAmount",
                        type: "uint256",
                      },
                      {
                        internalType: "uint256",
                        name: "minPartnerTransferAmount",
                        type: "uint256",
                      },
                    ],
                    internalType: "struct Bank.HouseEdgeSplit",
                    name: "houseEdgeSplit",
                    type: "tuple",
                  },
                  {
                    internalType: "uint256",
                    name: "balanceReference",
                    type: "uint256",
                  },
                  {
                    components: [
                      {
                        internalType: "uint16",
                        name: "thresholdRate",
                        type: "uint16",
                      },
                      {
                        internalType: "uint16",
                        name: "toTreasury",
                        type: "uint16",
                      },
                      {
                        internalType: "uint16",
                        name: "toTeam",
                        type: "uint16",
                      },
                    ],
                    internalType: "struct Bank.BalanceOverflow",
                    name: "balanceOverflow",
                    type: "tuple",
                  },
                ],
                internalType: "struct Bank.Token",
                name: "token",
                type: "tuple",
              },
            ],
            internalType: "struct Bank.TokenMetadata[]",
            name: "",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      block,
      chain,
    });

    // Filter BetSwirl's governance token
    const tokensWithoutBETS = tokens.filter((token) => token.symbol !== "BETS").map(i => i.tokenAddress)
    return sumTokens2({ chain, block, owner: bankAddressOfBlock, tokens: tokensWithoutBETS })
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
  avalanche: {
    treasury: treasury("avax"),
  },
};
