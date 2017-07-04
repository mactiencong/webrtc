function openUserMedia(){
    return navigator.mediaDevices.getUserMedia({"audio": true, "video": true});
}

function playUserMedia(mediaTagId, stream){
    $("#"+mediaTagId)[0].srcObject = stream;
}
// openUserMedia().then(stream=>playUserMedia("local-user-media", stream));

var peer = null;
var conn = null;
function connectPeer(){
    peer = new Peer({key: '4oxfts97y3m78pvi'});
    //peer = new Peer({key: 'peerjs', host: "matico-webcrtc.herokuapp.com", secure: true, port: 443});
    peer.on("open",(user_id)=>{
        console.log("UserID: " + user_id);
        $("#user-id").html("UserID: " + user_id);
    })
    peer.on("call", call=>{
        answer(call);
    })
    peer.on('connection', conn => {
        console.log("connected with: " + conn.peer);
        conn.on('data', data=>{
            console.log("received data: "+data+" from " + conn.peer);
            switch (data) {
                case "okcallnow": // the call request is accepted
                    // call
                    call();
                    break;
                case "callwithme": // receive a call request
                    var answer_conn = peer.connect(conn.peer);
                    answer_conn.on("open", ()=>{
                        if(confirm("Call?")) {
                            answer_conn.send("okcallnow") // accept the call request
                        }
                        else {
                            answer_conn.send("imbuzynow") // not accept
                        }
                    });
                    break;
                case "imbuzynow": // the call isnot accepted
                    alert(conn.peer + " is buzy now");
                    break;
                default:
                    break;
            }
        })
    })
}

function answer(call){
    openUserMedia().then(stream=>{
        call.answer(stream);
        call.on("stream", remoteStream => {
            playMedia(stream, remoteStream);
        })
    }).catch(err=>console.log(err+""));
}

function call(){
    openUserMedia().then(stream=>{
        var call = peer.call(getUserIdWantToCall(), stream);
        call.on("stream", remoteStream=>{
            playMedia(stream, remoteStream);
        })
    }).catch(err=>console.log(err+""));
}

function playMedia(stream, remoteStream){
    playUserMedia("local-user-media", stream);
    playUserMedia("remote-user-media", remoteStream);
}
var txtUserId = null;
function getUserIdWantToCall(){
    if(txtUserId) return txtUserId;
    txtUserId = $("#txtUserId").val();
    return txtUserId;
}

function requestACall(){
    conn = peer.connect(getUserIdWantToCall());
    conn.on("open", ()=>{
        console.log("connected to " + getUserIdWantToCall());
    })
}

function callNow(){
    console.log("request a call");
    conn.send('callwithme');
}

$(document).ready(()=>{
    $("#btnConnect").click(()=>connectPeer());
    $("#btnRequestCall").click(()=>requestACall());
    $("#btnCallNow").click(()=>callNow());
})