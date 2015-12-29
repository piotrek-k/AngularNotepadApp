/// <binding BeforeBuild='all' Clean='clean' />
"use strict";

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify");

var paths = {
    webroot: "./wwwroot/"
};

paths.js = paths.webroot + "js/**/*.js";
paths.minJs = paths.webroot + "js/**/*.min.js";
paths.css = paths.webroot + "css/**/*.css";
paths.minCss = paths.webroot + "css/**/*.min.css";
paths.concatJsDest = paths.webroot + "js/site.min.js";
paths.concatJsDestUnminified = paths.webroot + "js/site.js";
paths.concatCssDest = paths.webroot + "css/site.min.css";
paths.angularViewsDest = paths.webroot + "angularViews";

gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:jsunminified", function (cb) {
    rimraf(paths.concatJsDestUnminified, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css", "clean:jsunminified"]);

gulp.task("min:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs, './AngularPart/*.js', './AngularPart/**/**/*.js'], { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
    return gulp.src([paths.css, "!" + paths.minCss])
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task("min", ["min:js", "min:css"]);

gulp.task("copy:angularviews", function () {
    return gulp.src(['./AngularPart/**/**/*.html'])
        .pipe(gulp.dest(paths.angularViewsDest));
});

gulp.task("copy:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs, './AngularPart/*.js', './AngularPart/**/**/*.js'], { base: "." })
        .pipe(concat(paths.concatJsDestUnminified))
        .pipe(gulp.dest("."));
});

gulp.task("copy", ["copy:js", "copy:angularviews"]);

gulp.task("all", ["clean", "min", "copy"]);
