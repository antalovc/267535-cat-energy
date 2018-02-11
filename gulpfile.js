"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var normalize = require("node-normalize-scss");
var plumber = require("gulp-plumber");
var postCss = require("gulp-postcss");
var autoPrefixer = require("autoprefixer");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imageMin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgStore = require("gulp-svgstore");
var postHtml = require("gulp-posthtml");
var include = require("posthtml-include");
const sourceMaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
var run = require("run-sequence");
var del = require("del");
var server = require("browser-sync").create();

gulp.task("images", function() {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imageMin([
      imageMin.optipng({optimizationLevel: 3}),
      imageMin.jpegtran({progressive: true}),
      imageMin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", ["images"], function() {
  return gulp.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function() {
  return gulp.src("build/img/icon-*.svg")
    .pipe(svgStore({inlineSvg: true}))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function() {
  return gulp.src("source/*.html")
    .pipe(postHtml([include()]))
    .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
  gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass({
      includePaths: normalize.includePaths
    }))
    .pipe(postCss([
      autoPrefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("scripts", function () {
  return gulp.src("source/js/**/*.js")
    .pipe(plumber())
    .pipe(sourceMaps.init())
    .pipe(uglify())
    .pipe(sourceMaps.write(""))
    .pipe(gulp.dest("build/js"));
});

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "style",
    "webp",
    "sprite",
    "html",
    "scripts",
    done
  );
});

gulp.task("copy", function(){
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**",
      "source/js/**"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("source/*.html", ["html"]);
});
