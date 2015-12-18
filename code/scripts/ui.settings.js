function appendDevice(e) {
    var t = document.createElement("option");
    t.value = e.id, t.innerHTML = e.label || e.id, "audio" == e.kind ? audioDeviecs.appendChild(t) : videoDeviecs.appendChild(t)
}
var settingsPanel = getElement(".settings-panel");

getElement("#settings").onclick = function() {
    settingsPanel.style.display = "block"
}, 

getElement("#save-settings").onclick = function() {
    
    settingsPanel.style.display = "none", getElement("#autoTranslateText").checked ? (rtcMultiConnection.autoTranslateText = !0, rtcMultiConnection.language = getElement("#language").value) : rtcMultiConnection.autoTranslateText = !1, rtcMultiConnection.bandwidth.audio = getElement("#audio-bandwidth").value, rtcMultiConnection.bandwidth.video = getElement("#video-bandwidth").value, rtcMultiConnection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: !!getElement("#OfferToReceiveAudio").checked,
        OfferToReceiveVideo: !!getElement("#OfferToReceiveVideo").checked,
        IceRestart: !!getElement("#IceRestart").checked
    };
    
    var videWidth = getElement("#video-width").value,
        videHeight = getElement("#video-height").value;
    
    rtcMultiConnection.mediaConstraints.mandatory = {
        minWidth: videWidth,
        maxWidth: videWidth,
        minHeight: videHeight,
        maxHeight: videHeight
    }, 

    rtcMultiConnection.preferSCTP = !!getElement("#prefer-sctp").checked, 

    rtcMultiConnection.chunkSize = +getElement("#chunk-size").value, 

    rtcMultiConnection.chunkInterval = +getElement("#chunk-interval").value, 

    window.skipRTCMultiConnectionLogs = !!getElement("#skip-RTCMultiConnection-Logs").checked, 

    rtcMultiConnection.maxParticipantsAllowed = getElement("#max-participants-allowed").value, 

    rtcMultiConnection.candidates = {
        relay: getElement("#prefer-stun").checked,
        reflexive: getElement("#prefer-turn").checked,
        host: getElement("#prefer-host").checked
    }, 

    rtcMultiConnection.dataChannelDict = eval("(" + getElement("#dataChannelDict").value + ")"), 

    getElement("#fake-pee-connection").checked && (rtcMultiConnection.fakeDataChannels = !0, 
        rtcMultiConnection.session = {})
};

var audioDeviecs = getElement("#audio-devices"),
    videoDeviecs = getElement("#video-devices");
rtcMultiConnection.getDevices(function(e) {
    for (var t in e) t = e[t], appendDevice(t)
});