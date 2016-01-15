var ctemplate = require('./')
var fs = require('fs')
var glob = require('glob')
var path = require('path')
var tape = require('tape')

glob('tests/*.ctemplate', function(error, results) {
  if (error) {
    throw error }
  else {
    results.forEach(function(templateFile) {
      function withExtension(extension) {
        return templateFile.replace('.ctemplate', extension) }
      tape(path.basename(templateFile), function(test) {
        var template = fs.readFileSync(templateFile).toString()
        var context = JSON.parse(fs.readFileSync(withExtension('.json')))
        var result = fs.readFileSync(withExtension('.cform')).toString()
        test.equal(
          ctemplate(template, context),
          result)
        test.end() }) }) } })
