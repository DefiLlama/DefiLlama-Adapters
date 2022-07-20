const sdk = require("@defillama/sdk");
const abis = require("./abis.json");
const { BigNumber } = require("bignumber.js");

const validatorContract = "0x0000000000000000000000000000000000001000";
const validatorAddressList = [
  "0xCd4A92A21539Fd2b50d1ecabce89cCf7294100C8",
  "0xa22fD0F35d2416eC293E2D00A8eB0c3Bc633Aa91",
  "0x88Cf3c2a965e2636155bCEf7264B805E8f57EF97",
  "0xe8391988483355e6a8170AC10f5726D4868e5C68",
  "0x6DE767908d0d792385200E30d66A5696B24f709c",
];
const CHAIN = "jfin";

async function jfinTVL(timestamp, block, chainBlocks) {
  const validatorInfo = await Promise.all(
    validatorAddressList.map((address) =>
      sdk.api.abi.call({
        chain: CHAIN,
        block: block,
        target: validatorContract,
        abi: abis.find((abi) => abi.name === "getValidatorStatus"),
        params: [address],
      })
    )
  );
  const totalTVl = validatorInfo.reduce(
    (acc, vault) => acc.plus(BigNumber(vault.output.totalDelegated)),
    BigNumber(0)
  );
  return {
    "0x940bdcb99a0ee5fb008a606778ae87ed9789f257": totalTVl,
  };
}

module.exports = {
  methodology: "Stake Your Blockchain Experience.",
  timetravel: false,
  jfin: {
    tvl: jfinTVL,
  },
};
