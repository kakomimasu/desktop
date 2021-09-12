import { h, render } from "https://unpkg.com/preact@latest?module"
import { useState, useEffect, useRef } from "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module"

moveTo(100, 100)
resizeTo(1000, 600)

const App = () => {
  const [aiList, setAiList] = useState([])
  const [player1File, setPlayer1File] = useState()
  const [player2File, setPlayer2File] = useState()
  const [currentFile, setCurrentFile] = useState()
  const textarea = useRef()
  const [codeMirror, setCodeMirror] = useState()

  useEffect(async () => {
    setCodeMirror(CodeMirror.fromTextArea(textarea.current, { mode: "javascript" }))
    await reloadAIList()
  }, [])

  const installDeno = () => {
    native.exec(
      "start powershell -c \"iwr https://deno.land/x/install/install.ps1 -useb | iex\""
    )
  }

  const runServer = () => {
    native.exec(
      "start cmd /c \"deno run -A server\\server.ts\""
    )
  }

  const runClient = name => {
    native.exec(
      "start cmd /c \"deno run -A client-deno\\" + name + " --local\""
    )
  }

  const battle = () => {
    runClient(player1File)
    setTimeout(() => runClient(player2File), 100)
    native.exec("start http://localhost:8880/game/detail")
  }

  const openNewAIDialog = async () => {
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
    setPlayer1File(name)
    setCurrentFile(name)
  }

  const loadSrc = () => {
    setCurrentFile(player1File)
  }
  
  const saveSrc = async () => {
    await native.save("client-deno\\" + currentFile, codeMirror.getValue())
  }

  const copyTemplate = async name => {
    let src = await native.load("client_template.js")
    let path = "client-deno\\" + name
    if (native.exists(path)) {
      return null
    }
    src = src.replace(/#NAME#/g, name)
    await native.save(path, src)
    return path
  }

  const reloadAIList = async () => {
    const ignores = [
      "action.js",
      "algorithm.js",
      "benchmark.js",
      "client_template.js",
      "client_util.js",
      "kacom.js",
      "KakomimasuClient.js",
      "kidou.js"
    ]
    setAiList((await native.files("client-deno")).filter(a => a.endsWith(".js") && ignores.indexOf(a) == -1))
  }

  useEffect(() => {
    if (aiList.length == 0) {
      setPlayer1File(null)
      setPlayer2File(null)
      setCurrentFile(null)
      return
    }
    const a = aiList[0]
    if (!aiList.includes(player1File)) {
      setPlayer1File(a)
    }
    if (!aiList.includes(player2File)) {
      setPlayer2File(a)
    }
    if (!aiList.includes(currentFile)) {
      setCurrentFile(a)
    }
  }, [aiList])

  const benchmark = () => {
    // benchmark.jsの引数対応
    native.exec("start cmd /c \"deno run -A kakomimasu\\apiserver\\benchmark.js\"")
  }
  
  const openBrowser = () => {
    native.exec('start https://practice.kakomimasu.website/')
  }

  useEffect(async () => {
    if (!currentFile) {
      return
    }
    const src = await native.load("client-deno\\" + currentFile)
    codeMirror.setValue(src)
  }, [currentFile])

  return (
    h("React.Fragment", null,
      h("div", { class: "sidebar" },
        h("fieldset", null,
          h("legend", null, "準備"),
          h("button", { onClick: installDeno }, null, "Denoをインストール"),
          h("button", { onClick: runServer }, null, "サーバを起動")
        ),
        h("fieldset", null,
          h("legend", null, "コード"),
          h("select", { onChange: e => setPlayer1File(e.target.value) },
            aiList.map(a => h("option", { value: a, selected: a == player1File }, a))
          ),
          h("div", { style: { display: "flex" } },
            h("button", { onClick: loadSrc }, "開く"),
            h("button", { onClick: openNewAIDialog }, "新規"),
            h("button", { onClick: saveSrc }, "保存")
          )
        ),
        h("fieldset", null,
          h("legend", null, "相手"),
          h("select", { onChange: e => setPlayer2File(e.target.value) },
            aiList.map(a => h("option", { value: a }, a))
          ),
          h("div", { style: { display: "flex" } },
            h("button", { onClick: battle }, "対戦"),
            h("button", { onClick: benchmark }, "ベンチマーク")
          )
        ),
        h("fieldset", null,
          h("legend", null, "大会"),
          h("button", { onClick: openBrowser }, "大会サイトを開く"),
          h("div", null, "ログインしてアクセスキーを取得してください"),
          h("button", null, "AIをサーバに接続")
        )
      ),
      h("textarea", { ref: textarea })
    )
  )
}

render(h((App)), document.body)
