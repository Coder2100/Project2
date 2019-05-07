import os
from flask import Flask,render_template,request
from flask_socketio import SocketIO, emit,join_room,leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
# global variables
#users dictionary
usersList={}
#setting up limit for messages
maxMessages=100
#creating empty channels dictionary
channels={}
# from channels dict , store the generic channels & declare empty list of channels to be added
channels['General']=[]
# list of all channels except General
allChannels=[]


#main routes to emit events to
@app.route("/")
def index():
    return render_template('index.html')
#establish socket connection
@socketio.on('connect')
def connect():
    emit("sync all channels",{'channels':channels})
#General channel
@socketio.on('submit to all')
def submit_to_all(data):
    message={'text':data["chat"],'username':data['username'],"time":data['time']}
    channels['General'].append(message)
    if (len(channels['General'])>maxMessages):
        channels['General'].pop(0)
    emit("announce to all",{'channels':channels},broadcast=True)
# leaving specific channel
@socketio.on('return_general')
def come_back_to_general():
    emit("announce to all",{'channels':channels},broadcast=True)
#creating add channel and verify if channel avaiable
@socketio.on('add channel')
def new_channel(data):
    warning=""
    if data["channel"] in allChannels or data['channel']=="General":
        warning="There's channel with same name. use unique name."
    else:
        allChannels.append(data['channel'])
        channels[data["channel"]]=[]
    emit("add channel",{'channel':data["channel"],'warning':warning})
    #logging new user and validating if username not on the localStorage
@socketio.on('register user')
def new_username(data):
    username=""
    warning=""
    if data['username'] in usersList:
        warning="The username taken! create unique one."
    else:
        usersList[data['username']]=request.sid
        username=data["username"]
    emit("add username",{"username":username,'warning':warning})
#join_room() and leave_room() functions when moving between channels
# remove the old messages if exceed messageMax
@socketio.on('join')
def join(data):
    room = data["channel"]
    join_room(room)
    message={'text':data["chat"],'username':data['username'],"time":data['time']}
    channels[data["channel"]].append(message)
    if (len(channels[data["channel"]])>maxMessages):
        channels[data["channel"]].pop(0)
    emit("joined",{'channels':channels},room=room)

@socketio.on('leave')
def leave(data):
    room = data["channel"]
    leave_room(room)
    message={'text':data["chat"],'username':data['username'],"time":data['time']}
    channels[data["channel"]].append(message)
    if (len(channels[data["channel"]])>maxMessages):
        channels[data["channel"]].pop(0)
    emit("left",{'channels':channels},room=room)
#
@socketio.on('update users channels')
def update_users_channels(data):
    channel=data['channel']
    emit("update channels",{'channel':channel},broadcast=True)
# chtting in a specific room and remove the first i.e old message if exceed 100Max
@socketio.on('submit to room')
def submit_to_room(data):
    room = data["channel"]
    message={'text':data["chat"],'username':data['username'],"time":data['time']}
    channels[data["channel"]].append(message)
    if (len(channels[data["channel"]])>maxMessages):
        channels[data["channel"]].pop(0)
    emit("announce to room",{'channels':channels},room=room)
