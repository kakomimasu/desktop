let native = {
  exec: function(cmd, param) {
    let sh = new ActiveXObject("Shell.Application")
    sh.ShellExecute(cmd, param)
  },
  load: function(file) {
    let ado = new ActiveXObject("ADODB.Stream")
    ado.Type = 2
    ado.Charset = "utf-8"
    ado.Open()
    ado.LoadFromFile(file)
    let a = ado.ReadText(-1)
    ado.Close()
    return a
  },
  save: function(file, data) {
    let ado = new ActiveXObject("ADODB.Stream")
    ado.Type = 2
    ado.Charset = "utf-8"
    ado.Open()
    ado.WriteText(data)
    ado.SaveToFile(file, 2)
    ado.Close()
  },
  exists: function(file) {
    let fso = new ActiveXObject("Scripting.FileSystemObject")
    return fso.FileExists(file)
  },
  files: function(dir) {
    let fso = new ActiveXObject("Scripting.FileSystemObject")
    let d = fso.GetFolder(dir)
    let files = new Enumerator(d.files)
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
    let list = []
    for (; !files.atEnd(); files.moveNext()) {
      list.push(fso.GetFileName(files.item()))
    }
    return list
  }
}