var assert = require('assert');
var restify = require('restify');
var fs = require('fs');

/*
var client = restify.createJsonClient({
  url: 'http://localhost:8066',
  version: '~1.0'
});

  client.get('/get-all-sessions', function(err, req, res, obj) {
  	assert.ifError(err);
  	console.log('%j', obj);
  	return "bisht";
  });

*/


//-------------------------------------------- SESSION -------------------------------------

/**
 * @api {get} /user/:email Get user details 
 *
 * @apiName Get User
 * @apiGroup User
 * @apiParam {String} email  The emailid of user 
 * @apiDescription 
 * get user details based on email
 *
 * @apiSampleRequest https://localhost:5556/api/user/:email
 *
 */
function getUser() { 

  return "altanai"; 
}

/**
*
* @api {post}  /user/:email  Set user details
*
* @apiName Set user 
* @apiGroup User
* @apiParam {String} email  The emailid of user 
* @apiParam {String} name  The to be updates username of user 
* @apiDescription
* set details of a user based on email
*
* @apiSampleRequest /user/:email
*
*/
function postUser(userid) {

	return "rvefwfwe";
}



/*client.get('/echo/mark', function (err, req, res, obj) {
  assert.ifError(err);
  console.log('Server returned: %j', obj);
});*/



/*--------------------REST Server side interfaces --------------------------------*/


function postSession(req, res, callback) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var channelname= req.params.name;
    //res.send('hello ' + serviceRequired);
    channels[channelname] = channelname;     
    onNewNamespace(channelname,"SP");
    res.json({ type:true, name:channelname, url:"http://ip:port/#/"+channelname+"?s=1" });
    callback();
}

/**
 * @api {get} /get-all-sessions/ All sessions details  
 *
 * @apiName Get Session
 * @apiGroup Session
 * @apiDescription 
 * get all session details 
 *
 * @apiSampleRequest https://localhost:8066/get-all-sessions
 *
 */
function getAllSessions(req, res, callback) {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.json({ type:true, allChannels:"hbdchjbwd"});

    /*  
    for (i = 0; i < channels.length; i++) { 
        console.log("channels[i]");
    }
    res.json({ type:true, allChannels:channels});
    callback();*/
}

var options = {
  key: fs.readFileSync('../../ssl/devmiljul.key'),
  cert: fs.readFileSync('../../ssl/ef67e5761e550fa2.crt'),
  ca: fs.readFileSync('../../ssl/gd_bundle-g2-g1.crt'),
};


var server = restify.createServer(options);
//var server = restify.createServer();

server.get('/session/:name',postSession);
server.get('/get-all-sessions',getAllSessions);

//server.use(restify.jsonp());
//server.use(restify.CORS());
//server.use(restify.fullResponse());
/*server.use(  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  });*/

server.listen(8066, function() {
  console.log('%s listening at %s', server.name, server.url);
});

//-----------------------------------------