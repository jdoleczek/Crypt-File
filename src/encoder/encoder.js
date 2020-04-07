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

function uint8ToBase64(u8Arr) {
  let CHUNK_SIZE = 0x8000
  let index = 0
  let length = u8Arr.length
  let result = []
  let slice

  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length))
    result.push(String.fromCharCode.apply(null, slice))
    index += CHUNK_SIZE;
  }

  return btoa(result.join(''))
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
      let b64 = uint8ToBase64(encryptedBytes)

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
  onDragOver: () => dnd.style.display = 'block',
  onDragLeave: () => dnd.style.display = 'none'
})

module.exports = {
  handleFiles,
}
