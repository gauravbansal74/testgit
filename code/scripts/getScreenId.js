! function() {
    console.log("getScreenId - ");
    
    function e(e, o) {
        console.log("getScreenId - ", e , o);
        var d = {
            audio: !1,
            video: {
                mandatory: {
                    chromeMediaSource: e ? "screen" : "desktop",
                    maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
                    maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
                },
                optional: []
            }
        };
        return o && (d.video.mandatory.chromeMediaSourceId = o, d.video = !0), d
    }

    function o() {
        return d.isLoaded ? void d.contentWindow.postMessage({
            captureSourceId: !0
        }, "*") : void setTimeout(o, 100)
    }
    
    window.getScreenId = function(d) {

        function n(o) {
            o.data && (
                o.data.chromeMediaSourceId && (
                    "PermissionDeniedError" === o.data.chromeMediaSourceId ? 
                        d("permission-denied") : 
                        d(null, o.data.chromeMediaSourceId, e( null, o.data.chromeMediaSourceId))), 
                o.data.chromeExtensionStatus && d(
                    o.data.chromeExtensionStatus, null, e(o.data.chromeExtensionStatus)), 
                window.removeEventListener("message", n))
        }
        
        console.log(o(), void window.addEventListener("message", n));

        return navigator.mozGetUserMedia ? void d(null, "firefox", {
            video: {
                mozMediaSource: "window",
                mediaSource: "window"
            }
        }) : (o(), void window.addEventListener("message", n));
    };

    /*var d = document.createElement("iframe");
    d.onload = function() {
        d.isLoaded = !0
    }, 
    d.src = "pageforextension.html", 
   // d.style.display = "none", 
    (document.body || document.documentElement).appendChild(d);*/
}();