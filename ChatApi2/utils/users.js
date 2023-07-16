const users = [];

// Join user to chat
function userJoin(id, myID, room) {
  const index = users.findIndex((u) => u.id === id);

  if (index == -1) {
    const user = { id, myID, room };
    users.push(user);
    console.log(users);
    return user;
  } else {
    const user = users.find((u) => u.id === id);
    user.room = room;
    
    console.log(user);
    return user;
  }
}

// Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
};
