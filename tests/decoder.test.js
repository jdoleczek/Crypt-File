const fs = require('fs')
const path = require('path')
const fileSaver = require('file-saver')
let aesjs = require('aes-js')

const html = fs.readFileSync(path.resolve(__dirname, '../src/decoder/decoder.html'), 'utf8')

jest.mock('file-saver', function () {
  return {
    saveAs: jest.fn(),
  }
})

jest.mock('aes-js', function () {
  return {
    ModeOfOperation: {
      ctr: jest.fn(() => ({
        decrypt: jest.fn(() => []),
      })),
    },
    utils: {
      utf8: {
        toBytes: jest.fn(),
        fromBytes: jest.fn(() => ''),
      },
      hex: {
        toBytes: jest.fn(),
      },
    },
  }
})

describe('decoder', function () {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString()
  });

  afterEach(() => {
    jest.resetModules();
  })

  it('invalid password', function () {
    const fileSaverSaveAs = jest.spyOn(fileSaver, 'saveAs')
    let decoder = require('../src/decoder/decoder.js')
    decoder.getFile()
    expect(fileSaverSaveAs).not.toHaveBeenCalled()
  })

  it('valid password', function () {
    global.atob = jest.fn(() => '')

    jest.mock('aes-js', function () {
      return {
        ModeOfOperation: {
          ctr: jest.fn(() => ({
            decrypt: jest.fn(() => []),
          })),
        },
        utils: {
          utf8: {
            toBytes: jest.fn(),
            fromBytes: jest.fn(() => 'Created by Jan DOLECZEK A.D.2020'),
          },
          hex: {
            toBytes: jest.fn(),
          },
        },
      }
    })

    const fileSaverSaveAs = jest.spyOn(fileSaver, 'saveAs')
    let decoder = require('../src/decoder/decoder.js')
    decoder.getFile()
    expect(fileSaverSaveAs).not.toHaveBeenCalled()
  })

  it('keydown ENTER', function () {
    jest.mock('aes-js', function () {
      return {
        utils: {
          utf8: {
            toBytes: jest.fn(() => {throw new Error()}),
          },
        },
      }
    })

    let decoder = require('../src/decoder/decoder.js')

    expect(
      () => document.querySelectorAll('input[type=password]')[0].onkeydown({which: 13})
    ).toThrow()
  })

  it('keydown NOT ENTER', function () {
    let decoder = require('../src/decoder/decoder.js')

    expect(
      () => document.querySelectorAll('input[type=password]')[0].onkeydown({which: 32})
    ).not.toThrow()
  })
})
