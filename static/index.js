//jquery document ready to fire modal events and websockets
$(document).ready(function() {
// websocket address
    var socket=io.connect(location.protocol+'//'+document.domain+':'+location.port);
    // boolean expression to see if user is currenlty in channel
    isInRoom=false;
    // establish connect event
    socket.on('connect',()=>{
      // popup modal when userload the browser to local sever port http://127.0.0.1:5000/
        $('#textMessage').on("keyup",function(key) {
            activeChannel=$("#channelList .active").attr('id');
            if ($(this).val()!="" && !isInRoom && key.keyCode==13) {
                const chat=$(this).val();
                const username=localStorage.getItem('username');
                const time=new Date().toLocaleString();
                document.querySelector('#textMessage').value = '';
                socket.emit('submit to all',{'chat':chat,'username':username,'time':time});
            }// taken user input if currently not in a room or input is empty string
            if ($(this).val()!="" && isInRoom && key.keyCode==13) {
                const chat=$(this).val();
                const username=localStorage.getItem('username');
                const time=new Date().toLocaleString();
                document.querySelector('#textMessage').value = '';
                socket.emit('submit to room',{'channel':activeChannel,'chat':chat,'username':username,'time':time});
          }
        });
        //take channel info and save on local storage
        $('#channelList').on('click','li', function(){
            document.querySelector('#textMessage').focus();
            if (!localStorage.getItem('activeChannel')) {
                activeChannel="General";
            } else {
                activeChannel=localStorage.getItem('activeChannel');
            }
            const username=localStorage.getItem('username');
            const time=new Date().toLocaleString();
            $(this).addClass('active');
            $(this).siblings().removeClass('active');
            $('#messages').html("");
            if (activeChannel!="General") {
                socket.emit('leave',{'channel':activeChannel,'chat':'away','username':username,'time':time});
            }
            activeChannel=$("#channelList .active").attr('id');
            localStorage.setItem('activeChannel',activeChannel)
            if (activeChannel=='General') {
                isInRoom=false;
                return socket.emit('return_general');
            } else {
                isInRoom=true;
            }
            socket.emit('join',{'channel':activeChannel,'chat':'online','username':username,'time':time});
         });

        if (!localStorage.getItem('username')) {// if no username in the localStorage
            $("#chatModal").modal({backdrop: 'static', keyboard: false});
            document.querySelector('.modal-title').innerHTML= 'Please enter your username';
            document.querySelector('#userInput').value = '';
        }
    });

    // when sending to channel, sync all the messages typed by users
    socket.on('announce to all', data=> {
            syncMessages(data);
    });
// sync all the messages when joining a room, current and previous ones
    socket.on('joined', data=> {
        syncMessages(data);
        document.querySelector('#textMessage').focus();
    });

    socket.on('left', data=> {
        syncMessages(data);
    });

    socket.on('announce to room', data=> {
        syncMessages(data);
    });

    socket.on('sync all channels', data=> {
        $('#channelList li').remove();
        syncChannels(data);
        $('#'+localStorage.getItem('activeChannel')).click();
    });
// pop up modal to login the user if !login
    socket.on('add username', data=> {
        if (data["warning"]!="") {
            window.setTimeout(function () {
                $("#chatModal").modal({backdrop: 'static', keyboard: false});
                document.querySelector('.modal-title').innerHTML= data['warning'];
                document.querySelector('#userInput').value = '';
                document.querySelector('#submitButton').disabled = true;
            }, 900);
        } else {
            localStorage.setItem('username',data["username"]);
            document.querySelector('#username').innerHTML = localStorage.getItem('username');
            document.querySelector('#General').click();
            document.querySelector('#textMessage').focus();
        }
    });
// creating a channel if !exist, disable the submit button if no inputs or channel already exist
    socket.on('add channel', data=> {
        if (data["warning"]!="") {
            window.setTimeout(function () {
                $("#chatModal").modal({backdrop: 'static', keyboard: false});
                document.querySelector('.modal-title').innerHTML= data['warning'];
                document.querySelector('#userInput').value = '';
                document.querySelector('#submitButton').disabled = true;
            }, 900);
        } else {
            addChannel(data['channel']);
            $('#channelList li:last').addClass('active');
            $('#channelList li:last').click();
            isInRoom=true;
            var removeHash=$('#channelList li:last').text().slice(1);
            localStorage.setItem('activeChannel',removeHash);
            $('#channelList').scrollTop(100000)
            document.querySelector('#textMessage').focus();
            socket.emit('update users channels',{'channel':data['channel']});
        }
    });
// icreas channels by the addition or append old channels
    socket.on('update channels',data => {
        if ($('#'+data['channel']).length==0){
            addChannel(data['channel']);
        }
    });// standard modal to get user details abt channel
    $("#userInput").on('keyup', function (key) {
        if ($(this).val().length > 0 ){
            document.querySelector('#submitButton').disabled = false;
            if (key.keyCode==13 ) {
                document.querySelector('#submitButton').click();
            }
        }
        else {
            document.querySelector('#submitButton').disabled = true;
        }
    });
// standard modal for user register and Capslock the first letter of usernme, remove duplicae if any
    $("#submitButton").on('click', function () {
        if (!localStorage.getItem('username')) {
            var username= document.querySelector('#userInput').value;
            username=username.charAt(0).toUpperCase() + username.slice(1);
            socket.emit('register user',{'username':username});
        } else {
            var channelName=document.querySelector('#userInput').value;
            channelName=channelName.charAt(0).toUpperCase() + channelName.slice(1);
            socket.emit('add channel',{'channel':channelName});
        }
    });
// the jquery onclick event to fire the modal when adding a channel
    $('kbd').on('click',function (){
        $("#chatModal").modal({backdrop: 'static', keyboard: false});
        document.querySelector('.modal-title').innerHTML = 'Please enter channel name';
        document.querySelector('#userInput').value = '';
        document.querySelector('#submitButton').disabled = true;
    });
    document.querySelector('#username').innerHTML = localStorage.getItem('username');
});
