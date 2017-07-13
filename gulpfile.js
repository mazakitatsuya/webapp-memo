var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var browser = require("browser-sync");
var gcmq = require('gulp-group-css-media-queries');
var plumber = require("gulp-plumber");
var frontnote = require("gulp-frontnote");

gulp.task("server", function() {
    browser({
        server: {
            baseDir: "./"
        }
    });
}); 

gulp.task("sass", function() {
    gulp.src("assets/_scss/**/*.scss")
        .pipe(plumber())
        .pipe(frontnote({
            css: 'assets/css/style.css'
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest("assets/css"))
        .pipe(browser.reload({stream:true}))
});

gulp.task("default",['server'], function() {
    gulp.watch("assets/_scss/**/*.scss",["sass"]);
});