const express= require('express')
const socketio= require('socket.io')
const path= require('path')
const http= require('http')
const Filter= require('bad-words')
const app= express()
const {addUser,getUser,getUsersInRoom,removeUser} = require('./store/users')

const server= http.createServer(app)
const io= socketio(server)


//socket.emit() --> emits event(MESSAGE) to only specific client
//io.emit()  --> emits event to all clients available
// socket.broadcast.emit() --> emits event to all client except the one sending it..
// socket.join(room__name)  --> to join a particular room
//io.to(room__name).emit() --> emits message to all clients in the particular room
//socket.broadcast.to(room__name).emit() --> emits message to all clients int the particular room excpet the one who sent the message 



app.set('view engine', 'html');
const publicPath= path.join(__dirname,'./public')
app.use(express.static(publicPath))


io.on('connection',(socket)=>{
    console.log('new socket.io connection')
  

   //socket.id will tell current user's ID i.e which user has sent the current message.

  //Joining room and sending messages in room..
  socket.on('join',({username,room},callback)=>{
      socket.emit('room',room)
     const {error,user}= addUser({socketId:socket.id,name:username,room:room})
     
       if(error)
        return callback(error)
      socket.join(user.room)
     
      socket.emit('welcome',{
        text:`${user.name} welcome to the chat!`,
        createdAt:new Date().getTime(),
        username:'Admin'
    })
    socket.broadcast.to(user.room).emit('welcome',{
        text:`${user.name} has joined the chat!`,
        createdAt:new Date().getTime(),
        username:'Admin'
    })
   
    let usersList= getUsersInRoom(user.room)
    console.log(usersList)
   io.to(user.room).emit('usersList',usersList)
    socket.on('disconnect',()=>{
      
        const user=removeUser(socket.id)
        
        if(!user)
         return callback('some error occured')
        io.to(user.room).emit('welcome',{
            text:`${user.name} has left the chat!!`,
            createdAt:new Date().getTime(),
            username:'Admin'
        })
        usersList= getUsersInRoom(user.room)
        io.to(user.room).emit('usersList',usersList)
        callback()
    })   
  socket.on('location',(longitude,latitude,callback)=>{
    io.to(user.room).emit('link',{
     text:`https://google.com/maps?q=${latitude},${longitude}`,
     createdAt:new Date().getTime(),
     username:user.name
 })
    callback()
})      
   })

   socket.on('message',(message,callback)=>{
    const filter= new Filter()
    if(filter.isProfane(message))
     return callback('abusive words not allowed')
     
    const user= getUser(socket.id)
   
    if(!user)
     return callback('user not found!!')
    io.to(user.room).emit('welcome',{
     text:message,
     createdAt:new Date().getTime(),
     username:user.name
    })
        
    })
})  
 
   


// we will have to configure a client to connect with socketio server in this case index.html is our cliet..
const port= process.env.PORT
server.listen(port,()=>console.log(`listening on ${port}..`))