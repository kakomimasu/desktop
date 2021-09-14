import { h, render } from "https://unpkg.com/preact@latest?module"
import { useState, useCallback, useEffect, useRef } from "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module"
import htm from "https://unpkg.com/htm?module"

const html = htm.bind(h)

moveTo(100, 100)
resizeTo(1000, 600)

const App = () => {
  const [aiList, setAiList] = useState([])
  const [player1File, setPlayer1File] = useState()
  const [player2File, setPlayer2File] = useState()
  const [currentFile, setCurrentFile] = useState()
  const textarea = useRef()
  const [codeMirror, setCodeMirror] = useState()
  const [reload, setReload] = useState(true)

  const installDeno = useCallback(() => {
    native.exec(
      "start powershell -c \"iwr https://deno.land/x/install/install.ps1 -useb | iex\""
    )
  }, [])

  const runServer = useCallback(() => {
    native.exec(
      "start cmd /c \"deno run -A server\\server.ts\""
    )
  }, [])

  const runClient = useCallback(name => {
    native.exec(
      "start cmd /c \"deno run -A client-deno\\" + name + " --local\""
    )
  }, [])

  const battle = useCallback(() => {
    saveSrc()
    runClient(player1File)
    setTimeout(() => runClient(player2File), 100)
    native.exec("start http://localhost:8880/game/detail")
  }, [player1File, player2File])

  const openNewAIDialog = useCallback(async () => {
    let name
    while (true) {
      name = prompt("AI名を入力してください", "")
      if (name == null || name === "") {
        return
      }
      let path = await copyTemplate(name)
      if (path != null) {
        break
      }
      alert("他の名前を入力してください")
    }
    setReload(true)
    name += ".js"
    setPlayer1File(name)
    setCurrentFile(name)
  }, [])

  const loadSrc = useCallback(() => {
    setCurrentFile(player1File)
  }, [player1File])
  
  const saveSrc = useCallback(async () => {
    await native.save("client-deno\\" + currentFile, codeMirror.getValue())
  }, [currentFile, codeMirror])

  const copyTemplate = useCallback(async name => {
    let src = await native.load("client_template.js")
    let path = "client-deno\\" + name + ".js"
    if (native.exists(path)) {
      return null
    }
    src = src.replace(/#NAME#/g, name)
    await native.save(path, src)
    return path
  }, [])

  const benchmark = useCallback(() => {
    // benchmark.jsの引数対応
    native.exec("start cmd /c \"deno run -A kakomimasu\\apiserver\\benchmark.js\"")
  }, [])
  
  const openBrowser = useCallback(() => {
    native.exec('start https://kakomimasu.website/')
  }, [])

  useEffect(async () => {
    setCodeMirror(CodeMirror.fromTextArea(textarea.current, { mode: "javascript" }))
  }, [])

  useEffect(async () => {
    if (!reload) {
      return
    }
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
    setReload(false)
  }, [reload])

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

  useEffect(async () => {
    if (!currentFile) {
      return
    }
    const src = await native.load("client-deno\\" + currentFile)
    codeMirror.setValue(src)
  }, [currentFile])

  return html`
    <div class="sidebar">
      <fieldset>
        <legend>準備</legend>
        <button onClick=${installDeno}>Denoをインストール</button>
        <button onClick=${runServer}>サーバを起動</button>
      </fieldset>

      <fieldset>
        <legend>コード</legend>
        <select onChange=${e => setPlayer1File(e.target.value)}>
          ${aiList.map(a => html`
            <option value=${a} selected=${a == player1File}>${a}</option>
          `)}
        </select>
        <div style="display: flex">
          <button onClick=${loadSrc}>開く</div>
          <button onClick=${openNewAIDialog}>新規</div>
          <button onClick=${saveSrc}>保存</div>
        </div>
      </fieldset>

      <fieldset>
        <legend>相手</legend>
        <select onChange=${e => setPlayer2File(e.target.value)}>
          ${aiList.map(a => html`
            <option value=${a}>${a}</option>
          `)}
        </select>
        <div style="display: flex">
          <button onClick=${battle}>対戦</div>
          <!--
          <button onClick=${benchmark}>ベンチマーク</div>
          -->
        </div>
      </fieldset>

      <fieldset>
        <legend>大会</legend>
        <button onClick=${openBrowser}>大会サイトを開く</button>
        <!--
        <div>ログインしてアクセスキーを取得してください</div>
        <button>AIをサーバに接続</button>
        -->
      </fieldset>
    </div>
    <textarea ref=${textarea}></textarea>
  `
}

render(h((App)), document.body)
