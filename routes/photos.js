var router = require('express').Router();
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');

var knox = require('knox');
var MultiPartUpload = require('knox-mpu');

router.post('/tag', function(req, res) {
	var form = new multiparty.Form();

	form.parse(req, function(err, fields, files) {
		var photo = files.photoFile[0];
		// console.log(photo);

    var client = knox.createClient({
      key: 'AKIAIP5V3MTFTGUABADQ',
      secret: '',
      bucket: 'selfiequestdev'
    });

    var object = { foo: "bar" };
    var string = JSON.stringify(object);
    var req2 = client.put('/test/obj.json', {
        'Content-Length': string.length
      , 'Content-Type': 'application/json'
    });
    req2.on('response', function(res){
      if (200 == res.statusCode) {
        console.log('saved to %s', req.url);
      }
      else {
        console.log('failed %s', res.statusCode);
      }
    });
    req2.end(string);

    // client.putFile(photo.path, Math.random().toString().substr(2) + photo.originalFilename, function(err, result) {
    //   console.log(result);
      res.send("cool");
    // });
    //
    // var upload = new MultiPartUpload(
    //         {
    //             client: client,
    //             objectName: Math.random().toString().substr(2) + photo.originalFilename, // Amazon S3 object name
    //             file: photo.path
    //         },
    //         // Callback handler
    //         function(err, body) {
    //             if (err) {
    //               res.send("ERROR!!!! : " + err);
    //             }
    //             else
    //             {
    //               res.send(JSON.stringify(body));
    //             }
    //         }
    //     );
    //
		// var photoPath = '/photos/' + Math.random().toString().substr(2) + photo.originalFilename;
		// fs.rename(photo.path, path.resolve('./public'+photoPath), function() {
		// 	res.render('tag', { title: 'File Uploaded', imgPath: photoPath});
		// });
	});

});

module.exports = router;
