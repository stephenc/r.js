/*jslint plusplus: false */
/*global load: false, doh: false, parse: false, fileUtil: false, build: false */

"use strict";

//Load the file to test.
load("../jslib/build.js");
load("../jslib/fileUtil.js");

//Remove any old builds
fileUtil.deleteFile("builds");

(function () {
    function c(file) {
        return fileUtil.readFile(file);
    }
    
    //Remove line returns to make comparisons easier.
    function nol(contents) {
        return contents.replace(/[\r\n]/g, "");
    }

    //Do a build of require.js to get default pragmas processed.
    build(["..", "name=require", "baseUrl=../..", "out=builds/require.js", "includeRequire=true", "optimize=none"]);

    var requirejs = c("builds/require.js"),
        oneResult = [
                    requirejs,
                    "require.pause();\n",
                    c("../../tests/two.js"),
                    c("../../tests/one.js"),
                    c("../../tests/dimple.js"),
                    "\nrequire.resume();\n"
                ].join("");

    doh.register(
        "builds", 
        [
            function onCssFile(t) {
                build(["..", "cssIn=css/sub/sub1.css", "out=builds/sub1.css"]);

                t.is(nol(c("cssTestCompare.css")), nol(c("builds/sub1.css")));

                //Reset require internal state for the contexts so future
                //builds in these tests will work correctly.
                require.s.contexts = {};
            },

            function oneJsFile(t) {
                build(["..", "name=one", "include=dimple", "out=builds/outSingle.js",
                       "baseUrl=../../tests", "includeRequire=true", "optimize=none"]);

                t.is(nol(oneResult), nol(c("builds/outSingle.js")));

                //Reset require internal state for the contexts so future
                //builds in these tests will work correctly.
                require.s.contexts = {};
            },

            function simple(t) {
                //Do the build
                build(["..", "simple.build.js"]);

                t.is(nol(oneResult), nol(c("builds/simple/one.js")));

                //Reset require internal state for the contexts so future
                //builds in these tests will work correctly.
                require.s.contexts = {};
            },

            function excludeShallow(t) {
                build(["..", "name=uno", "excludeShallow=dos", "out=builds/unoExcludeShallow.js",
                       "baseUrl=../../tests", "optimize=none"]);
                t.is(nol("require.pause();\n" +
                     c("../../tests/tres.js") +
                     c("../../tests/uno.js") +
                     "\nrequire.resume();\n"), nol(c("builds/unoExcludeShallow.js")));
            },

            function exclude(t) {
                build(["..", "name=uno", "exclude=dos", "out=builds/unoExclude.js",
                       "baseUrl=../../tests", "optimize=none"]);
                t.is(nol("require.pause();\n" +
                     c("../../tests/uno.js") +
                     "\nrequire.resume();\n"), nol(c("builds/unoExclude.js")));
            }
        ]
    );
    doh.run();
}());
