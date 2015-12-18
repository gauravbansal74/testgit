var fs = require('fs');
var _static = require('node-static');
var logger = require('custom-logger').config({ level: 0 });
var mysql  = require('mysql');
var https = require('https');
var socketio = require('socket.io');

//Create the MySQL Pool
var pool = mysql.createPool({
    connectionLimit : 100, //important
    host      : 'localhost',
    //host     : '128.199.134.70', 
    port        : '3306',
    user        : 'root',
    //password    : '',
    password    : 'miljul123',
    //password  : 'altanaimysql',
    database    : 'miljul',
    debug       :  false
});

var lib= {};

//creating a new entry into session hostory table
lib.createSessionHistory = function(data, callback){
    
    var roomName = data.room;
    var userName = data.name;
    var userEmail = data.email;

    pool.getConnection(function(err, connection){

        console.log("createSessionHistory - Create new roomName "+ roomName + ' '+ userName+ ' '+userEmail );
        
        var sessionhistoryData  = [roomName,userEmail,userName,new Date(), '', 1];
        
        connection.query('INSERT INTO sessionhistory ( channel ,useremail , username , startAt , endAt ,  status) value (? , ? , ?, ?, ?, ?)', sessionhistoryData, 
            function(err, rows){    
                if(!err && rows.affectedRows == 1)  {
                    callback();                         
                }else{
                    callback(err,null);
                }
            });

        connection.release();
    }); 
};

//reading session hotory for finding the channels presence 
lib.readSessionHistory = function(channel, callback){
    console.log(" read session history for ", channel );
    var presenceflag=false;

    pool.getConnection(function(err, connection){
        connection.query('SELECT * FROM sessionhistory WHERE channel like ?', [channel],  
        function(err, rows , fields){ 
            
            if(!err && rows.length > 0){
                console.log("search in sessionhistory for ", channel  , "ran sucessfully ");
                presenceflag=true;
                callback(presenceflag);
            }
            else{
                console.log("search in sessionhistory for ", channel  , " was unsucessfull ");
                callback(presenceflag);
            }
       });
    
       connection.release();       
    
    });
};

//for updating the  users as they join a channel
lib.updateSessionHistoryUsers = function(data,callback){
    var roomName = data.room;
    var userName = data.name;
    var userEmail = data.email;

    pool.getConnection(function(err, connection){
        
        console.log("updateSessionHistoryUsers - Join existing roomName", roomName);

        connection.query('SELECT * FROM sessionhistory WHERE channel like ? AND status = 1', [roomName],  
        function(err, rows , fields){ 
            console.log("rows", rows);
            if(!err && rows.length > 0){
                connection.query('UPDATE sessionhistory SET  ? WHERE channel like ? AND status = 1', 
                    [ { 
                        useremail:  userEmail+","+rows[0].useremail,
                        username: userName+","+rows[0].username
                       }, 
                       roomName
                    ],
                    function(err, rows){
                        callback(err, rows);
                    });
            };
       });
    
       connection.release();       
    
    });
};

//for finding the status of the channels mapped into session history
lib.getSessionHistory = function(channel, callback){
    console.log(" read session history for ", channel );

    pool.getConnection(function(err, connection){
        connection.query('SELECT * FROM sessionhistory WHERE channel like ?', [channel],  
        function(err, rows , fields){ 
            
            if(!err && rows.length > 0){
                console.log("search in sessionhistory for ", channel  , "ran sucessfully ");
                callback(true, rows[0].channel ,rows[0].username , rows[0].useremail , rows[0].startAt , rows[0].endAt, rows[0].status);
            }
            else{
                console.log("search in sessionhistory for ", channel  , " was unsucessfull ");
                callback(false, " " ," " ," " ," "," "," ");
            }
       });
    
       connection.release();       
    
    });
};

module.exports = lib;

//-------------------------------start the file server ------------------------------------

var file = new _static.Server('./code', {
    cache: 3600,
    gzip: true,
    indexFile: "index.html"
});


var options = {
  key: fs.readFileSync('ssl/devmiljul.key'),
  cert: fs.readFileSync('ssl/ef67e5761e550fa2.crt'),
  ca: fs.readFileSync('ssl/gd_bundle-g2-g1.crt'),
};


//-------------------------------start the https web server ------------------------------------

var app = https.createServer(options, function(request, response){
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();     
});


//-------------------------------start the socketio server ------------------------------------

var io = socketio.listen(app, {
    log: false,
    origins: '*:*'
});

io.set('transports', [
    'websocket'
]);

var channels = {};

io.sockets.on('connection', function (socket) {
    
    logger.info('Socket recived - Connection ');

    if (!io.isConnected) {
        io.isConnected = true;
    }

    socket.on('new-channel', function (data) {  
        
        console.log("IO socket connection------------------------ new channel "+data.email+' '+data.name+' '+data.channel);      

        lib.readSessionHistory(data.channel , 
            function(isChannelPresent){
                if(isChannelPresent){
                    //join-channel
                    try{
                        var dbdata = {  room:data.channel, 
                                        name:data.name, 
                                        email:data.email
                                    };
                        lib.updateSessionHistoryUsers(dbdata, 
                                function (err, result){
                                    if(err) {
                                        console.log(" callback updateSessionHistoryUsers error ");
                                    }else {
                                        console.log(" callback updateSessionHistoryUsers success ");
                                    }
                                }
                        );               
                        socket.emit('joined-channel', dbdata.room);
                    }catch(err){
                        logger.error('Error in join-channel');
                    }
                }else{
                    //create the channel
                    try{
                        var dbdata = {  room:data.channel, 
                                        name:data.name, 
                                        email:data.email
                                    };
                        lib.createSessionHistory(dbdata, 
                                function (result , err){
                                    if(err) console.log(" callback createSessionHistory ", err);
                                    else {
                                        console.log(" callback createSessionHistory ", result);
                                    }
                                }
                        );               
                        socket.emit('created-channel', dbdata.room);
                    }catch(err){
                        logger.error('Error in namespace');
                    } 
                }
            });

        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (data) {
        logger.info('Socket received - presence ---> ', data.channel);
        lib.readSessionHistory(data.channel , 
            function(isChannelPresent){
                logger.info('presence ---> ', isChannelPresent);
                socket.emit('presence', isChannelPresent);
            });
    });

    /*    
    socket.on('create-channel', function (data) {
        logger.info('Socket received - new-channel ---> ',data );
        
        try{
            var dbdata = {  room:data.channel, 
                            name:data.name, 
                            email:data.email
                        };
            lib.createSessionHistory(dbdata, 
                    function (result , err){
                        if(err) console.log(" callbackcreateSessionHistory ", err);
                        else {
                            console.log(" callbackcreateSessionHistory ", result);
                            //onNewNamespace(dbdata.room, dbdata.name); 
                            //onNewNamespace(dbdata.room, data.sender); 
                        }
                    }
            );               
            socket.emit('created-channel', dbdata.room);
        }catch(err){
            logger.error('Error in namespace');
        }   
    });

    socket.on('join-channel', function (data) {
        logger.info('Socket received - join-channel ---> ',data );
        
        try{
            var dbdata = {  room:data.channel, 
                            name:data.name, 
                            email:data.email
                        };
            lib.updateSessionHistoryUsers(dbdata, 
                    function (err, result){
                        if(err) {
                            //console.log(" callbackupdateSessionHistoryUsers ", err);
                            console.log(" callbackupdateSessionHistoryUsers error ");
                        }else {
                            console.log(" callbackupdateSessionHistoryUsers success ");
                            //console.log(" callbackupdateSessionHistoryUsers ", result);
                            //onNewNamespace(dbdata.room, dbdata.name); 
                            //onNewNamespace(dbdata.room, data.sender); 
                        }
                    }
            );               
            socket.emit('joined-channel', dbdata.room);
        }catch(err){
            logger.error('Error in join-channel');
        }   
    });*/

    socket.on('leave-session', function (data) {
        logger.warn( 'Socket received - LeaveSession ---> ');
        console.log(data);
    });
    
});

function newsession(req, res, callback) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var channelname= req.params.name;

    socket.on('disconnect', function (data) {
        logger.warn( 'Socket received - disconnect ---> ');
        console.log(data);
    });

}

function onNewNamespace(channel, sender) {

    io.of('/' + channel).on('connection', 

        function (socket) {
            var username;
            //logger.info('onNewNamespace ---------------channel ',channel ," ", io.isConnected);

            if (io.isConnected) {
                io.isConnected = false;
                socket.emit('connect', true);
            }

            socket.on('message', function (data) {
                //console.log("On New Namespace------------------------ message ");
                if (data.sender == sender) {
                    //console.log("broadcasting everywhere : ",data.data , "|| Sender :", data.data.sender )
                    if(!username) username = data.data.sender;                
                    socket.broadcast.emit('message', data.data);
                }
            });

            socket.on('what-is-channel-status', function (data) {  
                
                logger.info("IO socket connection------------------------ channel status "+data.channel);      

                lib.getSessionHistory(data.channel , 
                    function(isChannelPresent, channel ,users , emails , started , ended , status){
                        if(isChannelPresent){ 

                                var channelData={
                                    channelname:'',
                                    name:users,
                                    email:emails,
                                    start:started,
                                    end:'',
                                    status:status
                                }; 
                                console.log(channelData.name);           
                                socket.emit('channel-status', channelData);
                        }else{             
                                socket.emit('channel-status', "channel doesn't exists");
                        }
                    }
                );
            });

            socket.on('disconnect', function() {
                logger.info("On New Namespace------------------------ disconnect userleft");
                if(username) {
                    socket.broadcast.emit('user-left', username);
                    username = null;
                }
            });
    
        });
}

var webserver=443;
app.listen(webserver);
logger.info('Web Server started,'+ webserver +' waiting for connections...' );


