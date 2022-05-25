var http = require('http');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
var express = require('express');
var app = express();
const path = require('path');
const helper = require('./util/helper');
// app.use(express.static('public'));
app.use('/public', express.static('public'));

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'upload/images/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// const upload = multer({dest: 'upload/'});

const PORT = 3000;

app.post('/upload', upload.single('photo'), (req, res) => {
    if(req.file) {
        res.json(req.file);
    }
    else throw 'error';
});

app.post('/upload-multiple-images', (req, res) => {
    // 10 is the limit I've defined for number of uploaded files at once
    // 'multiple_images' is the name of our file input field
    let upload = multer({ storage: storage, fileFilter: helper.imageFilter }).array('multiple_images', 5);

    upload(req, res, function(err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.files) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }
        let arr = [];
        req.files.forEach((v,i)=>{arr.push(v.path)});
        res.json(arr);
        // let result ="You have uploaded these images: <hr />";
        // const files = req.files;
        // let index, len;

        // // Loop through all the uploaded images and display them on frontend
        // for (index = 0, len = files.length; index < len; ++index) {
        //     result += `<img src="${files[index].path}" width="300" style="margin-right: 20px;">`;
        // }
        // result += '<hr/><a href="./">Upload more images</a>';
        // res.send(result);
    });
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// 日志记录中间件
app.use(function(request, response, next) {
  console.log("In comes a " + request.method + " to " + request.url);
  next();
});

app.get('/process_get', function (req, res) {
 
    // 输出 JSON 格式
    var response = {
        "first_name":req.query.first_name,
        "last_name":req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
 })

app.post('/process_post', urlencodedParser, function (req, res) {
 
    // 输出 JSON 格式
    var response = {
        "first_name":req.body.first_name,
        "last_name":req.body.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
 })
 
app.get('/html/:filename', function (req, res) {
    let filename = req.params.filename;
    res.sendFile( __dirname + "/html/" + filename );
 })

app.get('/upload/images/:filename', function (req, res) {
    let filename = req.params.filename;
    res.sendFile( __dirname + "/upload/images/" + filename );
})

app.post('/file_upload', function (req, res) {
 
    var form = new formidable.IncomingForm();
    form.parse(req, function (_err, fields, files) {
        console.log('robin files', files);
      var oldpath = files.filetoupload.filepath;
      var newpath =
        '/Users/mark/bitbucket/demoappNodejs/upload/' +
        files.filetoupload.originalFilename;
      fs.rename(oldpath, newpath, function (err) {
        if (err) {
          throw err;
        }
        // res.write('File uploaded and moved!');
        // res.end();
        let obj = {
            "code":0,
            "url":newpath
        };
        res.json(obj)
      });
    });
 })

// function requestHandler(req, res) {
//   if (req.url == '/fileupload') {
//     var form = new formidable.IncomingForm();
//     form.parse(req, function (_err, fields, files) {
//       var oldpath = files.filetoupload.filepath;
//       var newpath =
//         '/Users/mark/bitbucket/demoappNodejs/upload/' +
//         files.filetoupload.originalFilename;
//       fs.rename(oldpath, newpath, function (err) {
//         if (err) {
//           throw err;
//         }
//         // res.write('File uploaded and moved!');
//         // res.end();
//         let obj = {
//             "code":0,
//             "url":newpath
//         };
//         res.json(obj)
//       });
//     });
//   } else {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(
//       '<form action="fileupload" method="post" enctype="multipart/form-data">',
//     );
//     res.write('<input type="file" name="filetoupload"><br>');
//     res.write('<input type="submit">');
//     res.write('</form>');
//     return res.end();
//   }
// }

// http.createServer(app).listen(3000);

