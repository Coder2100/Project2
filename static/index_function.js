// js and jquery functions
//creating new channel and delete the last oen duplicated, uppercase the first letter
function addChannel(channel) {
    const li=document.createElement('li');
    li.className='list-group-item p-1';
    li.innerHTML='# '+channel.charAt(0).toUpperCase() + channel.slice(1);
    li.setAttribute("id", channel);
    document.querySelector('#channelList').append(li);
}
// synchronising channels
function syncChannels(data) {
    for (channel in data['channels']){
        addChannel(channel);
    }

}
//funtion for syncronising messages into the channel and display content left and right respectively
function syncMessages(data) {
        $('#messages').html("");
        for (x in data['channels'][activeChannel]) {
            const media=document.createElement('div');
            if (data['channels'][activeChannel][x]['username']==localStorage.getItem('username')) {
                media.className=' media d-flex flex-row-reverse';
            }else {
                media.className=' media';
            }
            const mediaLeft=document.createElement('div');
            mediaLeft.className=' media-left';
            const mediaBody=document.createElement('div');
            mediaBody.className=' media-left';
            const username=document.createElement('span');
            username.innerHTML=data['channels'][activeChannel][x]['username']
            username.className='font-weight-bold';
            const p=document.createElement('p');
            p.innerHTML=data['channels'][activeChannel][x]['text']
            p.className = 'font-italic';
            const time=document.createElement('small');
            time.innerHTML=data['channels'][activeChannel][x]['time'];
            time.className='text-muted pl-2';

            document.querySelector('#messages').append(media);
            media.append(mediaLeft);
            media.append(mediaBody);
            mediaBody.append(username);
            mediaBody.append(time);
            mediaBody.append(p);
            $('#messages').scrollTop(100000);
    }
}
