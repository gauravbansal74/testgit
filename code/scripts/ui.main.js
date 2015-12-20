function getElement(e) {
    return document.querySelector(e);
}

var usersList = getElement('.users-list');
var numbersOfUsers = getElement('.numbers-of-users');
numbersOfUsers.innerHTML = 1;
var usersContainer = getElement('.users-container');


//-----------------------------------------------
function getRandomColor() {
    for (var e = "0123456789ABCDEF".split(""), t = "#", n = 0; 6 > n; n++) t += e[Math.round(15 * Math.random())];
    return t
}

function addNewMessage(e) {
    if ("" != e.message && " " != e.message) {
        var t = document.createElement("div");
        t.style["float"] = "left", t.className = "user-activity user-activity-left", 
        t.innerHTML = '<div class="chatusername">' + e.header + "</div>";
        var n = document.createElement("div");
        n.className = "userchatmsg", 
        t.appendChild(n), 
        n.innerHTML = e.message, 
        document.getElementById("all-messages").appendChild(t), 
        $(".popup-messages").scrollTop($(".popup-messages")[0].scrollHeight) 
    }
}

function addNewMessagelocal(e) {
    if ("" != e.message && " " != e.message) {
        var t = document.createElement("div");
        t.style["float"] = "right", t.className = "user-activity user-activity-right", t.innerHTML = '<div class="chatusername">' + e.header + "</div>";
        var n = document.createElement("div");
        n.className = "userchatmsg", 
        t.appendChild(n), 
        n.innerHTML = e.message, 
        document.getElementById("all-messages").appendChild(t), 
        $(".popup-messages").scrollTop($(".popup-messages")[0].scrollHeight);
    }
}

function getUserinfo(e, t) {
    return e ? '<video src="' + e + '" autoplay></vide>' : '<img src="' + t + '">';
}

function fireClickEvent(e) {
    var t = new MouseEvent("click", {
        view: window,
        bubbles: !0,
        cancelable: !0
    });
    e.dispatchEvent(t)
}

function bytesToSize(e) {
    var t = ["Bytes", "KB", "MB", "GB", "TB"];
    if (0 == e) return "0 Bytes";
    var n = parseInt(Math.floor(Math.log(e) / Math.log(1024)));
    return Math.round(e / Math.pow(1024, n), 2) + " " + t[n]
}

function openEmailClientWithRoomLink() {
    var e = (location.href, "mailto:?subject=Miljul Invitation&body= Conference link: " + $("#currenturl").val()),
        t = window.open(e, "_blank");
    t && t.open && !t.closed && t.close()
}

function validateEmail(e) {
    var t = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return t.test(e)
}

var main = getElement(".main"),
    socket;

document.querySelector("#startcall").onclick = function() {
    
    //verify username 
    var e = document.querySelector("#username"),
        t = e.value;
    if ("" == t || " " == t) return void shownotification("Enter your name");
    
    //verify email
    var n = document.querySelector("#useremail");
    if (n = n.value, !validateEmail(n)) return void shownotification("Enter your email");
	
	document.querySelector("#username").value="";
	document.querySelector("#useremail").value="";
    
    //add extra infor to rtcmulticonnect
    rtcMultiConnection.extra = {
        username: t,
        color: "ffffff",
        email: n
    };
    
    var o = "/";
    var channelname;

    socket = io.connect(o), 

        //--------------------------open signalling channel --------------------------------------
    rtcMultiConnection.openSignalingChannel = function(e) {
        
        console.log("#startjs ----------opensignalling userid ",rtcMultiConnection.userid, "|| " , e.channel , "||", this.channel);
        console.log("#startjs ----------opensignalling name ",rtcMultiConnection.extra.username, "|| " , rtcMultiConnection.extra.email);


        var t = e.channel || this.channel;
        console.log("#startjs ----------opensignalling channel ", t),

        io.connect(o).emit("new-channel", {
            channel: t,
            sender: rtcMultiConnection.userid,
            name: rtcMultiConnection.extra.username,
            email: rtcMultiConnection.extra.email
        });


        var n = io.connect(o + t);    
        n.channel = t, 
        console.log(" n connect " , o+t, "channel " , n.channel),
        n.on("connect", function() {
            console.log("#startjs-------------------n.channel connect ");
            e.callback && e.callback(n)
        }), 

        n.send = function(e) {
            n.emit("message", {
                sender: rtcMultiConnection.userid,
                data: e
            })
        }, 

        n.on("message", e.onmessage), 
        
        n.on("disconnect", "datalost") ,

        setTimeout(function () {
            n.emit("what-is-channel-status", {
                channel: n.channel
            })
        }, 10000)

        n.on("channel-status",function(channeldata){
            
            var namesArr=channeldata.name.split(",");
            var emailsArr=channeldata.email.split(",");

            var self=namesArr[0]+" ( " + emailsArr[0]+ " ) ";
            var pself = document.createElement("P");
            var tself = document.createTextNode(self);
            pself.appendChild(tself);
            document.getElementById("selfInfo").innerHTML=" ";
            document.getElementById("selfInfo").appendChild(pself);

            //alert(namesArr.length);
            document.getElementById("peersInfo").innerHTML=" ";
            for(j=1;j<namesArr.length;j++){
                var p = document.createElement("P");
                var t = document.createTextNode(namesArr[j]+" ( " + emailsArr[j]+ " ) ");
                p.appendChild(t);
                document.getElementById("peersInfo").appendChild(p);
            }

            var d= new Date(channeldata.start);
            var x=d.toLocaleTimeString();

            var str_date=d.toDateString()+" at "+x.replace(x.slice(x.lastIndexOf(":"),x.lastIndexOf(" ")),"");

            var formatted_date=str_date.replace(str_date.slice(0,4),"");
            
            document.getElementById("startTime").innerHTML=formatted_date;
        })

    },

    //-------------------------Presence of Room ---------------------------------------
    // socketio presence check for the channel name 

    socket.emit("presence", {
        channel: rtcMultiConnection.channel
    }), 

    socket.on("presence", function(e) {

        e ? 
        (   console.log("Join room "),
            shownotification("Hang on. You are joining the room."), 
            document.getElementById("vl-room-app").style.display = "none", 
            document.getElementById("mainWrap").style.display = "block", 
            document.body.style.backgroundColor = "#323232",                     
            rtcMultiConnection.connect()

        ) : 
        (   console.log("Open room "),
            shownotification("Hang on. Your room is getting ready."), 
            document.getElementById("vl-room-app").style.display = "none", 
            document.getElementById("mainWrap").style.display = "block", 
            document.body.style.backgroundColor = "#3D3D3D", 
            rtcMultiConnection.open()
        )
    }),

    socket.emit("what-is-channel-status", {
        channel: rtcMultiConnection.channel
    }),
    

    document.getElementById("vl-room-app").style.display = "none", 

    socket.on("joined-channel", function(e) {
        console.log("============joined-channel==========");
        

        n = io.connect(o + t),    
        n.channel = t, 
        console.log(" open channel " , n.channel),

        n.on("connect", function() {
            console.log("#startjs-------------------n.channel connect ");
            e.callback && e.callback(n)
        }), 

        n.send = function(e) {
            console.log("#startjs------------------n.emit ");
            n.emit("message", {
                sender: rtcMultiConnection.userid,
                data: e
            })
        }, 

        n.on("message", e.onmessage), 
        
        n.on("disconnect", function(){ alert( "Lost Connection"); });

        rtcMultiConnection.connect();

    }),

    socket.on("created-channel", function(e) {
        console.log("============created-channel==========");


        n = io.connect(o + t),    
        n.channel = t, 
        console.log(" open channel " , n.channel),

        n.on("connect", function() {
            console.log("#startjs-------------------n.channel connect ");
            e.callback && e.callback(n)
        }), 

        n.send = function(e) {
            console.log("#startjs------------------n.emit ");
            n.emit("message", {
                sender: rtcMultiConnection.userid,
                data: e
            })
        }, 

        n.on("message", e.onmessage), 
        
        n.on("disconnect", function(){ alert( "Lost Connection"); });


        rtcMultiConnection.open() ;
    }),

    //-------------------------Session History Details ---------------------------------------
  
    socket.on("sessionhistorydetails", function(e) {
        console.log("============session Details==========");
        console.log(e);
    })
};

function getStats(){
    var keysUserids = Object.keys(rtcMultiConnection.peers); 
    var numbersOfUsers = getElement('.numbers-of-users');
    numbersOfUsers.innerHTM=keysUserids.length;
    for(i=1;i<keysUserids.length;i++){
        var pid=keysUserids[i];
        rtcMultiConnection.peers[pid].getConnectionStats(function(result) {
           document.getElementById("availableBandwidth").innerHTML=result.video.availableBandwidth;
        }, 5000);  
    }
}

var isShiftKeyPressed = !1;
   getElement(".main-input-box input").onkeydown = function(e) {
    16 == e.keyCode && (isShiftKeyPressed = !0)
};

var numberOfKeys = 0;
getElement(".main-input-box input").onkeyup = function(e) {
    if (numberOfKeys++, numberOfKeys > 3 && (numberOfKeys = 0), !numberOfKeys) {
        if (8 == e.keyCode) return rtcMultiConnection.send({
            stoppedTyping: !0
        });
        rtcMultiConnection.send({
            typing: !0
        })
    }
    return isShiftKeyPressed ? void(16 == e.keyCode && (isShiftKeyPressed = !1)) : void(13 == e.keyCode && (addNewMessagelocal({
        header: rtcMultiConnection.extra.username,
        message: linkify(this.value),
        userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], "//www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/images/chat-message.png"),
        color: rtcMultiConnection.extra.color
    }), rtcMultiConnection.send(this.value), this.value = ""))
}, 


getElement("#allow-screen").onclick = function() {
    this.disabled = !0;
    var screenid= captureSourceId();
    addsharescreen(screenid);
};

getElement("#install-allow-screen").onclick = function() {
    this.disabled = !0;
    chrome.webstore.install('https://chrome.google.com/webstore/detail/pmcehcchogemjkgofbnlhfdlgoedkpoa', 
       function() { 
            getElement("#allow-screen").click();
        }, 
       function() { 
            alert("You did not complete the extension installation !");
        });
};

//----------------------------------------------

var rtcMultiConnection = new RTCMultiConnection;

rtcMultiConnection.session = {
    video   : !0,
    audio   : !0,
    data    : !0.
}, 

rtcMultiConnection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: !0,
    OfferToReceiveVideo: !0
}, 

rtcMultiConnection.customStreams = {}, 

rtcMultiConnection.autoCloseEntireSession = !1, 

rtcMultiConnection.autoTranslateText = !1, 

rtcMultiConnection.maxParticipantsAllowed = 5, 

rtcMultiConnection.setDefaultEventsForMediaElement = !1, 

rtcMultiConnection.onopen = function(e) {
    shownotification("<b>" + e.extra.username + "</b> joined the conversation.")
};


/* ------------------------------------------------------------------
Who is typing status 
*/

var whoIsTyping = document.querySelector("#who-is-typing");

rtcMultiConnection.onmessage = function(e) {
    return e.data.typing ? 
    void(whoIsTyping.innerHTML = e.extra.username + " is typing ...") 
    : e.data.stoppedTyping ? 
        void(whoIsTyping.innerHTML = "") : 
        (   whoIsTyping.innerHTML = "", 
            addNewMessage({
                            header: e.extra.username,
                            message: rtcMultiConnection.autoTranslateText ? 
                                linkify(e.data) + " ( " + linkify(e.original) + " )" : linkify(e.data),
                            userinfo: getUserinfo(rtcMultiConnection.blobURLs[e.userid], "/chat-message.png"),
                            color: e.extra.color
            }), 
            void(document.title = e.data)
        )
};

//----------------------------------------------------------

var sessions = {};
rtcMultiConnection.onNewSession = function(e) {
    sessions[e.sessionid] || (sessions[e.sessionid] = e, e.join())
}, 

rtcMultiConnection.onRequest = function(e) {
    rtcMultiConnection.accept(e)
}, 

rtcMultiConnection.onCustomMessage = function(e) {
    if (e.hasCamera || e.hasScreen) {
        var t = e.extra.username + " enabled webcam.";
        e.hasScreen && (e.session.oneway = !0, rtcMultiConnection.sendMessage({
            renegotiate: !0,
            streamid: e.streamid,
            session: e.session
        }), t = e.extra.username + " is ready to share screen.")
    }
    if (e.hasMic && (e.session.oneway = !0, rtcMultiConnection.sendMessage({
            renegotiate: !0,
            streamid: e.streamid,
            session: e.session
        })), e.renegotiate) {
        var n = rtcMultiConnection.customStreams[e.streamid];
        n && rtcMultiConnection.peers[e.userid].renegotiate(n, e.session)
    }
}, 

rtcMultiConnection.blobURLs = {};

var islocalStream = 1;


rtcMultiConnection.onstream = function(e) {
    
    e.stream.getVideoTracks().length && ( rtcMultiConnection.blobURLs[e.userid] = e.blobURL);
    var t = e.mediaElement;
    
    if (t.setAttribute("preload", "none"), e.isScreen) {

        1 == islocalStream && (t.setAttribute("class", "local"), islocalStream = 0);
        
        var n = document.createElement("li");
        n.setAttribute("id", e.userid + "_screen");
        
        var i = document.createElement("div");
        i.setAttribute("class", "custom_wrapper");
        
        var o = document.createElement("div");
        o.setAttribute("class", "video"), 
        o.appendChild(t);
        
        //add the fullscreen button 
        var fullScreenButton = document.createElement("span");
        fullScreenButton.setAttribute("id", "fullScreenButton");

        fullScreenButton.setAttribute("title", "FullScreen");
        fullScreenButton.setAttribute("data-placement", "bottom");
        fullScreenButton.setAttribute("data-toggle", "tooltip");
        fullScreenButton.setAttribute("data-container", "body");

        //fullScreenButton.setAttribute("style","color: white;  float:right ; line-height: 1.4");
        fullScreenButton.className="pull-right fa fa-arrows-alt";
        fullScreenButton.onclick=function(event){
            //var vid=event.path[1].id;
            //var v= document.getElementById(vid).childNodes[0].childNodes[0].childNodes[0];
			
			var ele= event.target;
			var v=ele.parentNode.previousSibling.childNodes[0];
			v.requestFullscreen = v.requestFullscreen ||
            v.mozRequestFullScreen || v.webkitRequestFullscreen ||
            v.msRequestFullscreen;
            //alert("Video is about to go full sreen");
            v.requestFullscreen();
        };

     
        i.appendChild(o);
		
		var span_wrap=document.createElement("div");
        span_wrap.setAttribute("class", "video_icon_wrap");
        i.appendChild(span_wrap);
		
        n.appendChild(i);
        span_wrap.appendChild(fullScreenButton);

        console.log("mediaElement", n);
        usersContainer.appendChild(n);
    } 

    else {
        1 == islocalStream && (t.setAttribute("class", "local"), islocalStream = 0);
        
        var n = document.createElement("li");
        n.setAttribute("id", e.userid);
        
        //add the name subtag 
        var name = document.createElement("span");
        name.setAttribute("id", "name");
        //name.setAttribute("style","color:#FFF;float:left;padding-left: 20px; }");
        name.innerHTML=e.extra.username;

        //make subtage for video
        var i = document.createElement("div");
        i.setAttribute("class", "custom_wrapper");
        
        var o = document.createElement("div");
        o.setAttribute("class", "video"); 
        o.id=e.userid;
        o.appendChild(t); 



        //add the fullscreen button 
        var fullScreenButton = document.createElement("span");
        fullScreenButton.setAttribute("id", "fullScreenButton");

        fullScreenButton.setAttribute("title", "FullScreen");
        fullScreenButton.setAttribute("data-placement", "bottom");
        fullScreenButton.setAttribute("data-toggle", "tooltip");
        fullScreenButton.setAttribute("data-container", "body");

        //fullScreenButton.setAttribute("style","color: white;  float:right ; line-height: 1.4");
        fullScreenButton.className="pull-right fa fa-arrows-alt";
        fullScreenButton.onclick=function(event){
            //var vid=event.target.getAttribute("id");

            var ele= event.target;

           // var v= document.getElementById(vid).parentNode.previousSibling.childNodes[0];
           

            var v=ele.parentNode.previousSibling.childNodes[0];
			v.requestFullscreen = v.requestFullscreen ||
            v.mozRequestFullScreen || v.webkitRequestFullscreen ||
            v.msRequestFullscreen;
            //alert("Video is about to go full sreen");
            v.requestFullscreen();
            //v.webkitEnterFullScreen();
        };

        //add the audio mute button
        var videoButton=document.createElement("span");
        videoButton.id="videoButton";
        videoButton.setAttribute("data-val","mute");

        videoButton.setAttribute("title", "Mute/Unmute Video");
        videoButton.setAttribute("data-placement", "bottom");
        videoButton.setAttribute("data-toggle", "tooltip");
        videoButton.setAttribute("data-container", "body");


        videoButton.className="pull-right fa fa-video-camera";
        //videoButton.setAttribute("style","color: white; float: right;    padding-right: 10px; line-height: 1.4;");
        videoButton.onclick= function(event) {
            console.log(e);
            //var liVideoContainer=event.path[1].id;
            var ele=event.target;

            //var streamType= document.getElementById(liVideoContainer).childNodes[0].childNodes[0].childNodes[0].className;
            
            //var streamId= document.getElementById(liVideoContainer).childNodes[0].childNodes[0].childNodes[0].id;
            var streamType=$(ele).parent().prev('.video').children('video').attr('class');
            var streamId=$(ele).parent().prev('.video').children('video').attr('id');
            $(this).toggleClass('slash');
            console.log("Video => Stream ID : "+streamId+" Type : "+ streamType + " status :"+ this.getAttribute("data-val"));
            if("mute" == this.getAttribute("data-val") ){
                this.setAttribute("data-val", "unmute"); 
                rtcMultiConnection.streams[streamId].mute({
                    video: !0
                });
            } 
            else{
                this.setAttribute("data-val", "mute"); 
                rtcMultiConnection.streams[streamId].unmute({
                    video: !0
                });
            }  

        }; 

        //add the video mute button
        var audioButton=document.createElement("span");
        audioButton.id="audioButton";
        audioButton.setAttribute("data-val","mute");

        audioButton.setAttribute("title", "Mute/Unmute Audio");
        audioButton.setAttribute("data-placement", "bottom");
        audioButton.setAttribute("data-toggle", "tooltip");
        audioButton.setAttribute("data-container", "body");


        audioButton.className="pull-right fa fa-microphone";
       // audioButton.setAttribute("style","color: white; float: right;    padding-right: 25px; line-height: 1.4;");
        audioButton.onclick = function(event) {
            //var liVideoContainer=event.path[1].id;        
            //var streamType= document.getElementById(liVideoContainer).childNodes[0].childNodes[0].childNodes[0].className;
            //var streamId= document.getElementById(liVideoContainer).childNodes[0].childNodes[0].childNodes[0].id;
            
            var ele=event.target;
            var streamType=$(ele).parent().prev('.video').children('video').attr('class');
            var streamId=$(ele).parent().prev('.video').children('video').attr('id');
            
            $(this).toggleClass('slash');
            console.log("Video => Stream ID : "+streamId+" Type : "+ streamType + " status :"+ this.getAttribute("data-val"));
            if("mute" == this.getAttribute("data-val") ){
                this.setAttribute("data-val", "unmute"); 
                rtcMultiConnection.streams[streamId].mute({
                    audio: !0
                });
            } 
            else{
                this.setAttribute("data-val", "mute"); 
                rtcMultiConnection.streams[streamId].unmute({
                    audio: !0
                });
            }             
        };

        //add the snaspshot button
        var snapshotButton=document.createElement("div");
        snapshotButton.id="snapshotButton";
        snapshotButton.className="fa fa-camera";
        snapshotButton.setAttribute("style","color: white; float: right;    padding-right: 40px; line-height: 1.4;");
        snapshotButton.onclick = function() {
            var liVideoContainer=event.path[1].id;
            var streamId= document.getElementById(liVideoContainer).childNodes[0].childNodes[0].childNodes[0].id;
            var snaspshot=document.createElement("img");
            rtcMultiConnection.streams[streamId].takeSnapshot(function(snapshot) {
                snaspshot.src = snapshot;
                document.getElementById("imagePreview").appendChild(snaspshot);
            });         
        };

        i.appendChild(o); 

        //appending video_icon wrap after video
        var span_wrap=document.createElement("div");
        span_wrap.setAttribute("class", "video_icon_wrap");
        i.appendChild(span_wrap);

        n.appendChild(i);
        span_wrap.appendChild(name);
        span_wrap.appendChild(fullScreenButton);
        span_wrap.appendChild(audioButton);
        span_wrap.appendChild(videoButton);
        //n.appendChild(snapshotButton);

        console.log("mediaElement", n),
        console.log(rtcMultiConnection.streams),  
        usersContainer.appendChild(n);
        getStats();
    }

}, 

rtcMultiConnection.onstreamended = function(e) {
    e.isScreen ? $("#" + e.userid + "_screen").remove() : $("#" + e.userid).remove()
}, 

rtcMultiConnection.sendMessage = function(e) {
    e.userid = rtcMultiConnection.userid, 
    e.extra = rtcMultiConnection.extra, 
    rtcMultiConnection.sendCustomMessage(e)
}, 

rtcMultiConnection.onclose = rtcMultiConnection.onleave = function(e) {
    /*channel: rtcMultiConnection.channel,*/

    /*    
    socket.emit("disconnect", {
        channel: document.getElementById("currenturl").value,
        useremail:'abc' ,
        username: 'abc'
    });*/

    addNewMessage({
        header: e.extra.username,
        message: e.extra.username + " left the room.",
        userinfo: getUserinfo(rtcMultiConnection.blobURLs[e.userid], "info.png"),
        color: e.extra.color
    }), 

    $("#" + e.userid).remove(), 
    shownotification(e.extra.username + " left the conversation.") ;
};


/***************************************************************88
File sharing 
******************************************************************/

function updateLabel(e, r) {
    if (-1 != e.position) {
        var n = +e.position.toFixed(2).split(".")[1] || 100;
        r.innerHTML = n + "%"
    }
}

var progressHelper = {};

rtcMultiConnection.onFileStart = function(e) {

    addNewMessage({
        header: rtcMultiConnection.extra.username,
        message: "File shared: " + e.name + " ( " + bytesToSize(e.size) + " )",
        userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], "images/share-files.png"),
        callback: function(r) {        }
    });

    var n = document.createElement("div");
    n.title = e.name, 
    n.innerHTML = "<label>0%</label><progress></progress>", 
    document.querySelector(".userchatmsg").appendChild(n),             
    progressHelper[e.uuid] = {
        div: n,
        progress: n.querySelector("progress"),
        label: n.querySelector("label")
    }, 
    progressHelper[e.uuid].progress.max = e.maxChunks
}, 

rtcMultiConnection.onFileProgress = function(e) {
    var r = progressHelper[e.uuid];
    r && (r.progress.value = e.currentPosition || e.maxChunks || r.progress.max, updateLabel(r.progress, r.label))
}, 

rtcMultiConnection.onFileEnd = function(e) {
    if (!progressHelper[e.uuid]) return void console.error("No such progress-helper element exists.", e);
    var r = progressHelper[e.uuid].div;
    r.innerHTML = -1 != e.type.indexOf("image") ? 
        '<a href="' + e.url + '" download="' + e.name + '">Download ' + e.name + ' </a><b/><img src="' + e.url + '" title="' + e.name + '">' 
        : '<a href="' + e.url + '" download="' + e.name + '">Download ' + e.name + ' </a><br /><iframe src="' + e.url + '" title="' + e.name + '" style="width: 69%;border: 0;border-left: 1px solid black;height: inherit;"></iframe>', 
    setTimeout(function() {
        r = r.parentNode.parentNode.parentNode, 
        r.querySelector(".user-info").style.height = r.querySelector(".user-activity").clientHeight + "px"
    }, 10)
};


/*document.getElementById('file').onchange = function() {
    var file = this.files[0];
    rtcMultiConnection.send(file);
};*/

document.getElementById('file-input').onchange = function() {
    var file = this.files[0];
    rtcMultiConnection.send(file);
};


//-------------------------clear session on unload or disconnect 

// Used for confirmation , to closing the window 
/*window.onbeforeunload = function () {

    return  "Are you sure want to LOGOUT the session ?";
    channel: rtcMultiConnection.channel,

      
    socket.emit("leave-session", {
        channel: document.getElementById("currenturl").value,
        useremail: n,
        username: t
    });
    
    return "Session Closed";
}; 
*/
// Used to logout the session , when browser window was closed 
/*window.onunload = function () {

      if((sessionId != null)&&(sessionId!="null")&& (sessionId != ""))
        logout();
};*/

