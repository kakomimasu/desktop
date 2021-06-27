moveTo(100, 100)
resizeTo(1000, 1000)

async function init() {
  editor = CodeMirror.fromTextArea(src, {
    mode: "javascript"
  })
  await reloadAIList()
  await loadSrc()
}

function installDeno() {
  native.exec(
    "start powershell -c \"iwr https://deno.land/x/install/install.ps1 -useb | iex\""
  )
}

function runServer() {
  native.exec(
    "start cmd /c \"deno run -A kakomimasu\\apiserver\\apiserver.ts\""
  )
}

function runClient(name) {
  native.exec(
    "start cmd /c \"deno run -A kakomimasu\\client_deno\\" + name + " --local\""
  )
}

function battle() {
  runClient(p1.value)
  setTimeout(function() {
    runClient(p2.value)
  }, 100)
  native.exec("start http://localhost:8880/game/detail")
}

async function openNewAIDialog() {
  let name
  while (true) {
    name = prompt("AI名を入力してください", "")
    if (name == null || name === "") {
      return
    }
    name += ".js"
    let path = await copyTemplate(name)
    if (path != null) {
      break
    }
    alert("他の名前を入力してください")
  }
  await reloadAIList()
  for (let i = 0; i < p1.options.length; i++) {
    let a = p1.options[i]
    if (a.value === name) {
      a.selected = true
      break
    }
  }
  await loadSrc()
}

async function loadSrc() {
  editor.setValue(await native.load("kakomimasu\\client_deno\\" + p1.value))
}

function saveSrc() {
  native.save(editor.getValue(), "kakomimasu\\client_deno\\" + p1.value)
}

async function copyTemplate(name) {
  let src = await native.load("client_template.js")
  let path = "kakomimasu\\client_deno\\" + name
  if (native.exists(path)) {
    return null
  }
  let re = new RegExp("#NAME#", "g")
  src = src.replace(re, name)
  await native.save(path, src)
  return path
}

function endsWith(target, str) {
  let reg = new RegExp("^.*" + str + "$")
  return target.match(reg)
}

async function reloadAIList() {
  p1.innerHTML = ""
  p2.innerHTML = ""
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
  for (let i = 0; i < list.length; i++) {
    let fn = list[i]
    if (!endsWith(fn, "\\.js") || ignores.indexOf(fn) !== -1) {
      continue
    }
    let e1 = document.createElement("option")
    e1.value = fn
    e1.textContent = fn
    p1.appendChild(e1)
    let e2 = document.createElement("option")
    e2.value = fn
    e2.textContent = fn
    p2.appendChild(e2)
  }
}

function benchmark() {
  // benchmark.jsの引数対応
  native.exec("start cmd /c \"deno run -A kakomimasu\\apiserver\\benchmark.js\"")
}

function openBrowser() {
  native.exec('start https://practice.kakomimasu.website/')
}