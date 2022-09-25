import adapters from "../";
import { readdirSync } from 'fs'
const path = require("path")

const normalizeAdapterName = (adapter:string) => adapter.toLowerCase().split('-').join(' ')

const getDirectories = (source: string) =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const exportedAdapters = Object.keys(adapters).map(d=>d.toLowerCase())

// const adaptersList = Object.keys(adapters)
const adaptersList = getDirectories(path.resolve('./volumes/adapters'))
// console.log(adaptersList)

// console.log("Adapters enabled")
// console.log("_______________________")
// exportedAdapters.forEach(exportedAdapter => console.log(exportedAdapter))
console.log("\n")
console.log("Adapters NOT exported")
adaptersList.forEach(adapter => {
    if (!exportedAdapters.includes(normalizeAdapterName(adapter)))
        console.log(adapter)
})