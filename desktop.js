moveTo(100, 100)
resizeTo(1000, 1000)

function init() {
  a = 12
  editor = CodeMirror.fromTextArea(src, {
    mode: "javascript"
  })
  reloadAIList()
  loadSrc()
}

function installDeno() {
  native.exec(
    "powershell",
    "iwr https://deno.land/x/install/install.ps1 -useb | iex"
  )
}

function runServer() {
  native.exec(
    "deno",
    "run -A kakomimasu\\apiserver\\apiserver.ts"
  )
}

function runClient(name) {
  native.exec(
    "deno",
    "run -A kakomimasu\\client_deno\\" + name + " --local"
  )
}

function battle() {
  // window.showModelessDialog("launcher.hta","5","dialogHeight:400px;dialogWidth:300px")
  runClient(p1.value)
  setTimeout(function() {
    runClient(p2.value)
  }, 100)
  native.exec("http://localhost:8880/game/detail")
}

function openNewAIDialog() {
  let name
  while (true) {
    name = prompt("AI名を入力してください", "")
    if (name == null || name === "") {
      return
    }
    name += ".js"
    let path = copyTemplate(name)
    if (path != null) {
      break
    }
    alert("他の名前を入力してください")
  }
  reloadAIList()
  for (let i = 0; i < p1.options.length; i++) {
    let a = p1.options[i]
    if (a.value === name) {
      a.selected = true
      break
    }
  }
  loadSrc()
}

function loadSrc() {
  editor.setValue(native.load("kakomimasu\\client_deno\\" + p1.value))
}

function saveSrc() {
  native.save(editor.getValue(), "kakomimasu\\client_deno\\" + p1.value)
}

function copyTemplate(name) {
  let src = native.load("kakomimasu\\client_deno\\client_template.js")
  let path = "kakomimasu\\client_deno\\" + name
  if (native.exists(path)) {
    return null
  }
  let re = new RegExp("#NAME#", "g")
  src = src.replace(re, name)
  native.save(path, src)
  return path
}

function endsWith(target, str) {
  let reg = new RegExp("^.*" + str + "$")
  return target.match(reg)
}

function reloadAIList() {
  p1.innerHTML = ""
  p2.innerHTML = ""
  let list = native.files("kakomimasu\\client_deno")
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
  native.exec("deno", "run -A kakomimasu\\apiserver\\benchmark.js")
}

function openBrowser() {
  native.exec('https://practice.kakomimasu.website/')
}