const { series, parallel, src, dest } = require('gulp')
const inlinesource = require('gulp-inline-source')
const browserify = require('gulp-browserify')
const replace = require('gulp-replace')
const htmlmin = require('gulp-htmlmin')
const rename = require('gulp-rename')
const babel = require('gulp-babel')
const clean = require('gulp-clean')
const sass = require('gulp-sass')
const fs = require('fs')

const pkg = require('./package.json')

// --- DECODER ---

function buildDecryptHtmlTask(cb) {
  return src('src/decoder/decoder.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('temp'))
}

function buildDecryptJsTask(cb) {
  return src('src/decoder/decoder.js')
    .pipe(browserify({insertGlobals : true}))
    .pipe(babel())
    .pipe(dest('temp'))
}

function buildDecryptScssTask(cb) {
  return src('src/decoder/decoder.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('temp'))
}

function buildDecryptCombineTask(cb) {
  return src('temp/decoder.html')
    .pipe(inlinesource())
    .pipe(dest('temp'))
}

function buildDecryptTask(cb) {
  return series(
    parallel(
      buildDecryptHtmlTask,
      buildDecryptScssTask,
      buildDecryptJsTask
    ),
    buildDecryptCombineTask
  )(cb)
}

// --- ENCODER ---

function buildEncryptHtmlTask(cb) {
  return src('src/encoder/encoder.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('temp'))
}

function buildEncryptJsTask(cb) {
  return src('src/encoder/encoder.js')
    .pipe(replace('%DECODER%', fs.readFileSync('temp/decoder.html', 'utf-8')
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
    ))
    .pipe(browserify({insertGlobals : true}))
    .pipe(babel())
    .pipe(dest('temp'))
}

function buildEncryptScssTask(cb) {
  return src('src/encoder/encoder.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('temp'))
}

function buildEncryptCombineTask(cb) {
  return src('temp/encoder.html')
    .pipe(inlinesource())
    .pipe(dest('temp'))
}

function buildEncryptTask(cb) {
  return series(
    parallel(
      buildEncryptHtmlTask,
      buildEncryptScssTask,
      buildEncryptJsTask
    ),
    buildEncryptCombineTask
  )(cb)
}

// --- BUILD ---
function buildCombineTask(cb) {
  return src('temp/encoder.html')
    .pipe(inlinesource())
    .pipe(replace('%AUTHOR%', pkg.author))
    .pipe(replace('%DECODER%', pkg.description))
    .pipe(replace('%VERSION%', pkg.version))
    .pipe(rename('crypt-file.html'))
    .pipe(dest('dist'))
}

function buildTask(cb) {
  return series(
    buildDecryptTask,
    buildEncryptTask,
    buildCombineTask
  )(cb)
}

// --- CLEAN ---

function cleanTask(cb) {
  return src(['temp', 'dist'], {read: false, allowEmpty: true})
    .pipe(clean())
}

// --- EXPORTS ---

exports.default = series(cleanTask, buildTask)
exports.build = buildTask
exports.clean = cleanTask
