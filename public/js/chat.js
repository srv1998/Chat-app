const socket=io()
let messageTemplate= document.querySelector('#message-template').innerHTML
let $messages= document.querySelector('#messages')
let linkTemplate= document.querySelector('#link-template').innerHTML
let roomTemplate= document.querySelector('#room_template').innerHTML
let $roomName= document.querySelector('.room__name')
let usersTemplate = document.querySelector('#users_template').innerHTML
//socket.emit() --> emits event(MESSAGE) to only specific client
//io.emit()  --> emits event to all clients available
// socket.broadcast.emit() --> emits event to all client except the one sending it..
// socket.join(room__name)  --> to join a particular room
//io.to(room__name).emit() --> emits message to all clients in the particular room
//socket.broadcast.to(room__name).emit() --> emits message to all clients int the particular room excpet the one who sent the message 


const autoScroll=()=>{
    // new message element..
    const $newMessage= $messages.lastElementChild

    //height of new message element..
    const newMessageStyles=getComputedStyle($newMessage)
    const marginBottom= parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight + marginBottom

    //visible height: height of $message element which can contain multiple $newMessage elements..
    const visibleHeight= $messages.offsetHeight

    //height of $messages container : height of content of $messages container
    const containerHeight= $messages.scrollHeight

    //how far i have scrolled?
    const scrollOffset= $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
      $messages.scrollTop= $messages.scrollHeight

}


socket.on('link',(link)=>{
    const html = Mustache.render(linkTemplate,{
        message:link.text,
        createdAt:moment(link.createdAt).fromNow(),
        username:link.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
socket.on('welcome',(msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate,{
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a'),
        username:msg.username
    }) //Mustache is used to insert dynamic content
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
   
})

document.querySelector('#msg-btn').addEventListener('click',(e)=>{
    e.preventDefault()
    const msg=document.querySelector('#text').value
    
    document.querySelector('#text').value=' '
    document.querySelector('#text').focus()
    document.querySelector('#msg-btn').disabled=true
    socket.emit('message',msg,(profanity)=>{

        if(profanity)
         return console.log(profanity)
        console.log('message delivered!') 
    })
    document.querySelector('#msg-btn').disabled=false
})

document.querySelector('#loc-btn').addEventListener('click',()=>{
    document.querySelector('#loc-btn').disabled=true
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position=>{
            //console.log(position.coords.latitude,position.coords.longitude)
            socket.emit('location',position.coords.longitude,position.coords.latitude,()=>{
                console.log('location shared')
            })
        })
    }
    else
     return alert('location feature is not supported by your browser')
     document.querySelector('#loc-btn').disabled=false
})

//parsing query
const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.emit('join',{username,room},(error)=>{
   if(error)
   {
       alert(error)
       location.href='/'
   }
})

socket.on('room',(room)=>{
  const html=Mustache.render(roomTemplate,{room})
  $roomName.innerHTML=html
})

socket.on('usersList',(usersList)=>{
    document.querySelector('#users-list').innerHTML=''
    usersList.forEach(user=>{
        const html= Mustache.render(usersTemplate,{user:user.name})
       
        document.querySelector('#users-list').insertAdjacentHTML('beforeend',html)
           })
  
})