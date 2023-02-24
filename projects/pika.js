const { sumTokens2 } = require('./helper/unwrapLPs')
const chain = 'optimism'

async function tvl(_, _b, { [ chain]: block }) {
  const owners = [
    '0x2FaE8C7Edd26213cA1A88fC57B65352dbe353698', '0xD5A8f233CBdDb40368D55C3320644Fb36e597002',
  ]
  const tokens = ['0x7f5c764cbc14f9669b88837ca1490cca17c31607']
  return sumTokens2({ chain, block, owners, tokens, })
}

module.exports = {
	optimism: {
		tvl
	}
}