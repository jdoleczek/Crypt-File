const fileSaver = require('file-saver')
const dragDrop = require('drag-drop')
const aesjs = require('aes-js')

let ref = 'Created by Jan DOLECZEK A.D.2020'
let decoderTemplate = '%DECODER%'
let body = document.getElementsByTagName('body')[0]
let password = document.querySelectorAll('input[type=password]')[0]
let dnd = document.getElementById('dnd')

function crypt(bytes, key) {
  let aesCtr = new aesjs.ModeOfOperation.ctr(key)
  return aesCtr.encrypt(bytes)
}

function handleFiles(files) {
  let key = aesjs.utils.utf8.toBytes(
    (password.value + ref).substr(0, 32)
  )

  let encryptedRefBytes = crypt(aesjs.utils.utf8.toBytes(ref), key)
  let encryptedRefHex = aesjs.utils.hex.fromBytes(encryptedRefBytes)

  files.forEach(file => {
    let fileReader = new FileReader()

    fileReader.addEventListener('load', ev => {
      let encryptedBytes = crypt(new Uint8Array(ev.target.result), key)
      let b64 = btoa(String.fromCharCode.apply(null, encryptedBytes))

      let encryptedFileNameBytes = crypt(aesjs.utils.utf8.toBytes(file.name), key)
      let encryptedFileNameHex = aesjs.utils.hex.fromBytes(encryptedFileNameBytes)

      let decoder = decoderTemplate
        .replace('%DATA%', b64)
        .replace('%FILENAME%', encryptedFileNameHex)
        .replace('%REF%', encryptedRefHex)

      let blob = new Blob([decoder], {type: 'application/octal-stream'})
      fileSaver.saveAs(blob, file.name + '.html')
    })

    fileReader.readAsArrayBuffer(file)
  })
}

password.focus()

document.querySelectorAll('input[type=file]')[0].addEventListener('change', function(ev){
  handleFiles([...ev.target.files])
})

dragDrop(body, {
  onDrop: files => handleFiles(files),
  onDragEnter: () => {},
  onDragOver: () => dnd.style.display = 'block',
  onDragLeave: () => dnd.style.display = 'none'
})
