#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlUrl = function(htmlurl, onload) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

/*Checks the html and prints the result to the console*/
var checkHtmlFnBuilder = function(checksfile) {
    return function(html) {
	$ = cheerio.load(html);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
    }
};

var checkHtmlFile = function(htmlfile, checksfile) {
    return checkHtmlFnBuilder(checksfile)(fs.readFileSync(htmlfile));
};

var checkHtmlUrl = function(htmlurl, checksfile) {
    rest.get(htmlurl).on('complete', checkHtmlFnBuilder(checksfile));
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', null, HTMLFILE_DEFAULT)
	.option('-u, --url <html_url>', 'Url to html file')
	.parse(process.argv);

    if(program.file)
	checkHtmlFile(program.file, program.checks);
    else if(program.url)
	checkHtmlUrl(program.url, program.checks);
    else {
	console.log("No html file or url specified. Exiting.");
	process.exit(1);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkHtmlUrl = checkHtmlUrl;
}
