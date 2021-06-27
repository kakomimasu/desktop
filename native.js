const { exec } = require("child_process")
const fs = require("fs").promises

let native = {
  exec: function(cmd) {
    exec(cmd)
  },
  load: async function(file) {
    return (await fs.readFile(file)).toString()
  },
  save: async function(file, data) {
    await fs.writeFile(file, data)
  },
  exists: function(file) {
    return require("fs").existsSync(file)
  },
  files: async function(dir) {
    return await fs.readdir(dir)
  }
}