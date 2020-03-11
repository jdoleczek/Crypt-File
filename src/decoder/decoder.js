let fileSaver = require('file-saver')
let aesjs = require('aes-js')

let ref = 'Created by Jan DOLECZEK A.D.2020'
let password = document.querySelectorAll('input[type=password]')[0]

function decrypt(bytes, key) {
  let aesCtr = new aesjs.ModeOfOperation.ctr(key)
  return aesCtr.decrypt(bytes)
}

function getFile() {
  let key = aesjs.utils.utf8.toBytes(
    (password.value + ref).substr(0, 32)
  )

  let decryptedRefBytes = decrypt(aesjs.utils.hex.toBytes('%REF%'), key)
  let decryptedRef = aesjs.utils.utf8.fromBytes(decryptedRefBytes)

  if (decryptedRef != ref) {
    document.body.style.backgroundColor = 'darkred'
    password.value = ''
    return
  } else {
    document.body.style.backgroundColor = 'green'
  }

  let encryptedBytes = atob('%DATA%').split('').map(c => c.charCodeAt(0))
  let decryptedBytes = decrypt(encryptedBytes, key)

  let decryptedFileNameBytes = decrypt(aesjs.utils.hex.toBytes('%FILENAME%'), key)
  let fileName = aesjs.utils.utf8.fromBytes(decryptedFileNameBytes)

  let blob = new Blob([decryptedBytes], {type: 'application/octal-stream'})
  fileSaver.saveAs(blob, fileName)
}

password.onkeydown = function(ev) {
  if (ev.which == 13) {
    getFile()
  }
}

module.exports = {
  getFile,
}
