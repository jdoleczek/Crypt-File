const fs = require('fs')
const path = require('path')
const fileSaver = require('file-saver')

const html = fs.readFileSync(path.resolve(__dirname, '../src/encoder/encoder.html'), 'utf8')

function MockFile() {}

MockFile.prototype.create = function () {
    let blob = new Blob([''], { type: 'plain/txt' })
    blob.lastModifiedDate = new Date()
    blob.name = 'mock.txt'
    return blob;
}

global.FileReader = jest.fn(() => {
  let load

  return {
    addEventListener(ev, fn) {load = fn},
    readAsDataURL: jest.fn(),
    readAsArrayBuffer() {
      load({
        target: {
          result: Uint8Array.from([1]),
        }
      })
    },
  }
})

jest.mock('file-saver', function () {
  return {
    saveAs: jest.fn(),
  }
})

describe('encoder', function () {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString()
  });

  afterEach(() => {
    jest.resetModules();
  })

  it('handleFiles test', function () {
    const fileSaverSaveAs = jest.spyOn(fileSaver, 'saveAs')
    let encoder = require('../src/encoder/encoder.js')
    encoder.handleFiles([new MockFile()])
    expect(fileSaverSaveAs).toHaveBeenCalled()
  })
})
