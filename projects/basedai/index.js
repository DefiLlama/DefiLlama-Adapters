const { staking } = require('../helper/staking');

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      "0xa6b816010ab51e088c4f19c71aba87e54b422e14",
      "0xA9E8aCf069C58aEc8825542845Fd754e41a9489A"
    )
  },
  methodology: "Currently, the TVL is considered as the amount of Pepecoin tokens held in the farming contract at '0xa6b816010ab51e088c4f19c71aba87e54b422e14'."
};
