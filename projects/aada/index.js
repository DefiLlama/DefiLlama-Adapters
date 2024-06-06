const { sumTokensExport } = require("../helper/chain/cardano");

const scriptAdresses = [
  "addr1zy9940grv28qxz9k82l9gmqd80vfd8a2734e35yzsz9cqktfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9smq5w00", //request.hs -- Request created. Lender to fund
  "addr1zykhtew0z93z6hmgu2ew7kl9puqz0wmafp0f3jypuejkwmrfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9skq4p22", //collateral.hs -- Loan funded. Borrower to repay
  "addr1zxfgvtfgp9476dhmq8fkm3x8wg20v33s6c9unyxmnpm0y5rfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9st8q78h", //interest.hs -- Borrower repaid -- Lender to claim
  "addr1zxcjtxuc7mj8w6v9l3dfxvm30kxf78nzw387mqjqvszxr4mfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9sp92046", //liquidation.hs -- Funds were liquidated. Borrower to claim
  "addr1zytwe3qhc0kf5k8yaur60cnhcxjg9zvfdnftp0rfu2czprtfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9sgzwepc", //debt_request.hs -- Funds locked as liquidity deposits   'addr1z8tjrqy2dj5uk6her4ksltyxy2flzykktxkahzlahm9nwctfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9st86ewu', //request.hs v2 -- Funds locked as liquidity deposits
  "addr1zyc7w5n699ews00yujnhw59g4nuzykuzgl5x6nzqp49zv5tfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9sdyxnxc", //collateral.hs v2-- Funds locked as liquidity deposits
  "addr1zy6v8c7xdhftln7zk5uvt9h6jaknaxlx6hz5nkw63mpgwamfjcnq9fczt4qkxgec2hz6x7f38vnj8xuxywk4x4qgzh9sw9snf6", //debt_request.hs v2-- Funds locked as liquidity deposits
  "script1xt5vpt33fm6tu3fvz65enpnlvmg6z7gle9evktmuwn3c6gjfc7p", // Pool contract
  "script1nwvlaa0wnf43wzjp3xv738k6myam74dlrlh027mq20trg3ng772", // Collateral contract
  "script1sqscxzh7mkzlmgf98k3tuadkds8xt3yzzj8t3jnfpypukld9xck", // Leftovers contract
];

module.exports = {
  methodology:
    "Calculates the total of idle tokens held in pool contracts or collateral tokens secured in the collateral contract.",
  timetravel: false,
  cardano: {
    staking: sumTokensExport({
      owner: "addr1wyvej5rmcrhfpcwrwmnqsjtwvf8gv3dn64vwy3xzekp95wqqhdkwa",
      tokens: [
        "8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f6958741414441",
      ],
    }),
    tvl: sumTokensExport({ scripts: scriptAdresses }),
  },
  hallmarks: [[1708560053, "V2 Launch"]],
};
