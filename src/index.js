const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const userExists = users.find((user) => user.username == username)

  if(!userExists){
    return response.status(404).json({error: "User not exist"})
  }
  request.userFinded = userExists
  next()
}

/* User type
  { 
    id: 'uuid', // precisa ser um uuid
    name: '', 
    username: '', 
    todos: []
  }
*/

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const uuid = uuidv4();

  const userExists = users.some((item)=> (item.username == username))

  if(userExists){
    return response.status(400).json({error: 'User already exists'})
  }

  const objectUser = {
    id: uuid,
    name, 
    username, 
    todos: []
  }

  users.push(objectUser);
  return response.status(201).json(objectUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {userFinded} = request;

  return response.status(200).json(userFinded.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {userFinded} = request;
  const {title, deadline} = request.body;
  const uuid = uuidv4();

  const objectTodo={
      id: uuid, // precisa ser um uuid
      title: title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
  }
  userFinded.todos.push(objectTodo)

  return response.status(201).json(objectTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {title, deadline} = request.body;
  const {userFinded} = request;

  const todoFinded = userFinded.todos.find(todo => todo.id===id)

  if(!todoFinded){
    return response.status(404).json({error: 'Todo not found'})
  }

  todoFinded.title = title;
  todoFinded.deadline = new Date(deadline);

  return response.json(todoFinded)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {userFinded} = request;

  var todoFinded = userFinded.todos.find((todo)=> todo.id===id)

  if(!todoFinded){
    return response.status(404).json({error: 'Todo not found'})
  }
  todoFinded.done=true
  
  return response.json(todoFinded)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {userFinded} = request;

  const todoFinded = userFinded.todos.find((todo)=> todo.id === id);

  if(!todoFinded){
    return response.status(404).json({error: 'Todo not found'})
    
  }
  
  userFinded.todos.splice(todoFinded, 1)
  return response.status(204).send()
});

module.exports = app;