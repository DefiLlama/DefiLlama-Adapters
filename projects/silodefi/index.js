const call = 913906096

const put = 913951447


async function getAccounts(apps) {
  const path = `https://algoindexer.algoexplorerapi.io/v2/accounts?application-id=`;
  let localStates = []

  for (let i = 0; i < apps.length; i++) {
    let data = await fetch(path + apps[i])
    let dataJSON = await data.json()
    //console.log(dataJSON.accounts)
    dataJSON.accounts.forEach(account => {
      account["apps-local-state"].forEach((state) => {
        if (state?.id === apps[i]) {
          if (state["key-value"]) {
            state["key-value"].forEach((entry) => {
              if (entry.key) {
                let key = window.atob(entry.key)
                if (key) {
                  localStates.push(key + " " + entry.value.uint)
                }
              }
            })
          }

        }
      })
    })


  }
  console.log(localStates)
  return localStates
}

getAccounts([call, put])
