const { SPECIFIC_CASE_LOCKERS} = require('./utils')

async function common(api, res) {
  const lockers = res.filter((locker) => !SPECIFIC_CASE_LOCKERS.includes(locker.id) && locker.chainId === api.chainId)
  const calls = lockers.map(l => ({ target: l.modules.veToken, params: l.modules.locker })) 
  const balances = await api.multiCall({ abi: 'function locked(address arg0) view returns (int128 amount, uint256 end)', calls })

  api.addTokens(lockers.map(l => l.token.address), balances.map(b => b.amount))
}

async function pendle(api, res) {
  const locker = res.find(l => l.id === "pendle")
  const balance = await api.call({
    abi: 'function positionData(address arg0) view returns (uint128 amount, uint128 end)',
    target: locker.modules.veToken,
    params: locker.modules.locker
  })

  api.add(locker.token.address, balance.amount)
}

async function yieldnest(api, res) {
  const locker = res.find(l => l.id === "ynd")
  const balance = await api.call({
    abi: 'function getLockedBalance() public view returns (uint256 totalLockedBalance)',
    target: locker.modules.depositor,
  })
  
  api.add(locker.token.address, balance)
}

async function maverick(api, res) {
  const locker = res.find(l => l.id === "mav")
  const balance = await api.call({
    abi: 'function lockups(address,uint256) view returns (uint256 amount, uint256 end, uint256 points)',
    target: locker.modules.veToken,
    params: [locker.modules.locker, 0]
  })
  
  api.add(locker.token.address, balance.amount)
}

async function spectra(api, res) {
  const locker = res.find(l => l.id === "spectra")
  const balance = await api.call({
    abi: 'function locked(uint256 _tokenId) view returns (int128 amount, uint256 end, bool isPermanent)',
    target: locker.modules.veToken,
    params: 1263
  })
  
  api.add(locker.token.address, balance.amount)
}

async function zero(api, res) {
  const locker = res.find(l => l.id === "zero")
  const balance = await api.call({
    abi: 'function getLockedNftDetails(address _user) view returns (uint256[] nftIds, tuple(uint256 amount, uint256 end, uint256 start, uint256 power)[] lockedBalance)',
    target: locker.modules.veToken,
    params: locker.modules.locker
  })

  api.add(locker.token.address, balance.lockedBalance[0].amount)
}

async function frax(api, res) {
  const locker = res.find(l => l.id === "fxs")

  if (api.chainId === 1) {
    const balance = await api.call({
      abi: 'function locked(address arg0) view returns (int128 amount, uint256 end)',
      target: locker.extensions.sideChains[0].veToken,
      params: locker.extensions.sideChains[0].locker
    })
    
    api.add(locker.extensions.sideChains[0].token, balance.amount)
  } else if (api.chainId === 252) {
    const balance = await api.call({
      abi: 'function balanceOfLockedFxs(address _addr) public view returns (uint256 _balanceOfLockedFxs)',
      target: locker.modules.veToken,
      params: locker.modules.locker
    })

    api.add(locker.token.address, balance)
  }
}

module.exports = {
  common,
  pendle,
  yieldnest,
  maverick,
  spectra,
  zero,
  frax
}