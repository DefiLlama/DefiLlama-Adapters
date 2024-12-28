const { sumTokens2 } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ tokenAccounts: [
    '8vyTqVVPmJfqFexRcMBGDAHoSCyZ52RC5sRVhYzbfU4j',
    '7zJVLbx3DjjwkoD6eUGk4cgoBv2JR3RW67c3ff8URXYh',
    '2CD9R7K7AjAswjTJDmdf9HyUZQztfck1B22h9WUJeTeh',
    '377U1dX3mRd96BeoRkpmsJC67wnVDqTpi1u6dALkR9V5',
    'DUrVECpx5EkVW12eWvpjR8Xk2AgNS3epqEQ6p63SujQb',
    '6F5XPaeEiAwfmD5Rv9TAt4x7VhVaEU7qV9q6MSrvbozC',
    '6sSZcCfPaeKfGnTRXX3Ybd97eqVnYg1TLfytwArfUVz',
    'E2VKdRPvfMXBj3ePMbuZPRz1fwT7z7Gd9pnh8R3n25eW',
    'AV3pjicfiJQoR96mGT9byQLbUAXL2Zi1a74wis9Ezh5S',
    '5aJ5NzNmLfVLbqcbvYsW1e1GdEccrkFkLZwLWVLrmm4A',
    '2sKjWWYcdBmUQbdHBJXKbJBwHB2G9JB7mRnLYuEtgRcp',
  ]})
  
}
module.exports = {
  timetravel: false,
  methodology: "Snapshots of the TVL from app.katana.so are saved periodically into the statistics repo",
  solana: {
    tvl,  
  }
};