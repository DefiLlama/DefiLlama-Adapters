const treasuryAddress = "0xB3FC6B9be3AD6b2917d304d4F5645a311bCFd0A8";
const erc20Tokens = [
  //MDX
  "0x25d2e80cb6b86881fd7e07dd263fb79f4abe033c",
  //BOO
  "0xff96dccf2763d512b6038dc60b7e96d1a9142507",
];

/*** Treasury ***/
const Treasury = async (api) => {
  return api.sumTokens({ owner: treasuryAddress, tokens: erc20Tokens });
};

module.exports = {
  heco: {
    tvl: Treasury,
  },
};
