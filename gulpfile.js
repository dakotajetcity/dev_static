var gulp = require('gulp');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-ruby-sass');
var cache = require('gulp-cached');
var bower = require('main-bower-files');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var uglify = require("gulp-uglify");
var plumber = require("gulp-plumber");
var watch = require('gulp-watch');
var browserSync = require('browser-sync');

var paths;
paths = {
  url: 'example.dev',
  themeDir: 'src/',
  css: 'dist/css/',
  js: 'dist/js/',
  img: 'dist/images/',
  font: 'dist/font/',
  cssDev: 'assets/css/',
  sassDev: 'assets/sass/',
  jsDev: 'assets/js/',
  imgDev: 'assets/images/',
  fontDev: 'assets/font/',
};

gulp.task('opt', function () {
  gulp.start(['cssmin']);
  gulp.start(['jsmin']);
});

// css結合 & 圧縮 & dist/cssへ格納
gulp.task('cssmin', function () {
  var assetsCssPaths = paths.themeDir + paths.cssDev;
  var assetsSassPaths = paths.themeDir + paths.sassDev;
  var distCssPaths = paths.themeDir + paths.css;

  return gulp.src(assetsCssPaths + '*.css')
    .pipe(plumber())
    .pipe(concat('style.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(distCssPaths))
    .pipe(browserSync.reload({stream: true}));
});

// sass ※required gulp-ruby-sass
gulp.task('sass', function () {
  var assetsCssPaths = paths.themeDir + paths.cssDev;
  var assetsSassPaths = paths.themeDir + paths.sassDev;
  var distCssPaths = paths.themeDir + paths.css;

  return sass(assetsSassPaths, { style: 'expanded' })
    .pipe(plumber())
    .pipe(autoprefixer(["last 2 version", 'ie >= 9', 'iOS >= 7', 'Android >= 4']))
    //.pipe(cssmin())
    //.pipe(rename({suffix: '.min'}))
    // assets/css/に格納↓
    .pipe(gulp.dest(assetsCssPaths))
    // dist/css/に格納↓
    .pipe(gulp.dest(distCssPaths))
    .pipe(browserSync.reload({stream: true}));
});

// jsの監視(だけ)
gulp.task("js", function() {
  return gulp.src(paths.themeDir + paths.jsDev + '*.js')
    .pipe(plumber())
    //.pipe(uglify())
    .pipe(gulp.dest(paths.themeDir + paths.js))
    .pipe(browserSync.reload({stream: true}));
});

// jsの圧縮 & dist/jsへ格納
gulp.task("jsmin", function() {
  return gulp.src(paths.themeDir + paths.jsDev + '*.js')
  .pipe(plumber())
  .pipe(uglify({preserveComments: 'some'}))
  .pipe(gulp.dest(paths.themeDir + paths.js))
  .pipe(browserSync.reload({stream: true}));
});

// 画像の圧縮 (予定。今はassetsからdistに格納してるだけ)
gulp.task("img", function() {
  // assetsのイメージパス
  var assetsImgPaths = paths.themeDir + paths.imgDev;
  // distのイメージパス
  var distImgPaths = paths.themeDir + paths.img;
  return gulp.src(assetsImgPaths + '**/*')
  .pipe(gulp.dest(distImgPaths))
  .pipe(browserSync.reload({stream: true}));
});

// BowerjsとBowercssを実行
gulp.task('bower', function() {
  gulp.start(['bowercss']);
  gulp.start(['bowerjs']);
});

// Bowerで取得したCSSライブラリーをassets/css下に格納
gulp.task('bowercss', function() {
  var cssFilter = filter('**/*.css');
  // assets/cssを指定↓
  var assetsCssDir = paths.themeDir + paths.cssDev;
  var distCssDir = paths.themeDir + paths.css;
  //scssFilter = filter('**/*.scss');
  //sassFilter = filter('**/*.sass');

  return gulp.src(bower())
    .pipe(cssFilter)
    //.pipe(cssmin())
    //.pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(assetsCssDir))
    .pipe(gulp.dest(distCssDir));
});

// Bowerで取得したjsライブラリーをassets/js下に結合 $ 格納 ※required gulp-filter main-bower-files gulp-concat
gulp.task('bowerjs', function() {
  var jsFilter = filter('**/*.js');
  // assets/jsを指定
  var jsDir = paths.themeDir + paths.jsDev;

  return gulp.src(bower())
    .pipe(jsFilter)
    .pipe(concat('lib.js'))
    .pipe(gulp.dest(jsDir));
});

// browserSync
gulp.task('browser-sync', function () {
  browserSync({
    proxy: paths.url
  });
});

gulp.task("browserSyncTask", function () {
  browserSync({
    server: {
      baseDir: paths.themeDir
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

// Watch ※gulp-watchを使用したタスク監視
gulp.task('watch', function () {
  // sass監視
  watch(paths.themeDir + paths.sassDev + "**/*.scss", function() {
    gulp.start(['sass']);
  });
  // js監視
  watch(paths.themeDir + paths.jsDev + "**/*.js", function() {
    gulp.start(['js']);
  });
  // image監視
  watch(paths.themeDir + paths.imgDev + "**/*", function() {
    gulp.start(['img']);
  });
  // 静的ファイル監視
  watch(paths.themeDir + "**/*", function() {
    gulp.start("bs-reload");
  });
});

gulp.task('default', ['browserSyncTask'], function () {
  gulp.start(['watch']);
});
