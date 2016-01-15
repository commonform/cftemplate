var cftemplate = require('./')
var fs = require('fs')
var glob = require('glob')
var path = require('path')
var tape = require('tape')

glob('tests/*', function(error, results) {
  if (error) {
    throw error }
  else {
    results.forEach(function(directory) {
      function read(file) {
        return fs.readFileSync(path.join(directory, file)).toString() }
      tape(path.basename(directory), function(test) {
        test.equal(
          cftemplate(
            read('input.cftemplate'),
            directory,
            JSON.parse(read('context.json'))),
          read('output.cform'))
        test.end() }) }) } })
