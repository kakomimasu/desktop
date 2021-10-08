moveTo(100, 100)
resizeTo(1000, 600)

window.main = () => ({
  aiList: [],

  async init() {
    editor = CodeMirror.fromTextArea(src, {
      mode: "javascript"
    })
    await this.reloadAIList()
    if (this.aiList.length > 0) {
      await this.loadSrc(this.aiList[0])
    }
  },
  installDeno() {
    native.exec(
      "start powershell -c \"iwr https://deno.land/x/install/install.ps1 -useb | iex\""
    )
  },
  runServer() {
    native.exec(
      "start cmd /c \"deno run -A kakomimasu\\apiserver\\apiserver.ts\""
    )
  },
  runClient(name) {
    native.exec(
      "start cmd /c \"deno run -A kakomimasu\\client_deno\\" + name + " --local\""
    )
  },
  battle() {
    this.runClient(p1.value)
    setTimeout(() => {
      this.runClient(p2.value)
    }, 100)
    native.exec("start http://localhost:8880/game/detail")
  },
  async openNewAIDialog() {
    let name
    while (true) {
      name = prompt("AI名を入力してください", "")
      if (name == null || name === "") {
        return
      }
      name += ".js"
      let path = await this.copyTemplate(name)
      if (path != null) {
        break
      }
      alert("他の名前を入力してください")
    }
    await this.reloadAIList()
    for (let i = 0; i < p1.options.length; i++) {
      let a = p1.options[i]
      if (a.value === name) {
        a.selected = true
        break
      }
    }
    await this.loadSrc(name)
  },
  async loadSrc(name) {
    editor.setValue(await native.load("kakomimasu\\client_deno\\" + name))
  },
  saveSrc() {
    native.save(editor.getValue(), "kakomimasu\\client_deno\\" + p1.value)
  },
  async copyTemplate(name) {
    let src = await native.load("client_template.js")
    let path = "kakomimasu\\client_deno\\" + name
    if (native.exists(path)) {
      return null
    }
    src = src.replace(/#NAME#/g, name)
    await native.save(path, src)
    return path
  },
  async reloadAIList() {
    let list = await native.files("kakomimasu\\client_deno")
    let ignores = [
      "action.js",
      "algorithm.js",
      "benchmark.js",
      "client_template.js",
      "client_util.js",
      "kacom.js",
      "KakomimasuClient.js",
      "kidou.js"
    ]
    this.aiList = list.filter(a => 
      a.endsWith(".js") && ignores.indexOf(a) == -1)
  },
  benchmark() {
    // benchmark.jsの引数対応
    native.exec("start cmd /c \"deno run -A kakomimasu\\apiserver\\benchmark.js\"")
  },
  openBrowser() {
    native.exec('start https://practice.kakomimasu.com/')
  }
})

window.onload = () => Alpine.start()
