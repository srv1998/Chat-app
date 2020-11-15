const users= []


const addUser=({socketId,name,room})=>{
    name= name.trim().toLowerCase()
    room= room.trim().toLowerCase()
    if(!name || !room)
     return {error:'username or room missing!!!',user:undefined}
    
     const userExists= users.find((user)=>user.room==room && user.name==name)

     if(userExists)
      return {error:'Username already taken!!',user:undefined}
     const user= {socketId,name,room}
     console.log('user:',user)
     users.push(user)
    
     return {error:undefined,user}
}

const removeUser= (socketId)=>{
    const id= users.findIndex((user)=>user.socketId===socketId)
    if(id!=-1)
     return users.splice(id,1)[0]
    else
     return undefined 
   
}

const getUser=(socketId)=>{
  const user= users.find((user)=>user.socketId===socketId)
  if(!user)
   return undefined
  return user 
}

const getUsersInRoom=(room)=>{
    const usersInRoom= users.filter((user)=>user.room===room)
    return usersInRoom
}

module.exports={
    getUser,
    getUsersInRoom,
    addUser,
    removeUser
}

