const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

    
  const user = users.find(users => users.username === username);

    
  if (!user) {
        return response.status(404).json({ error: "User not found"});
  }

    
  request.user = user;

  return next();
}

function idTodoCheck(user, id) {
  const todosCheck = user.todos.find(todos => todos.id === id);
  return todosCheck
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usersAlreadyExist = users.some(
        (user) => user.username === username 
    );

    if (usersAlreadyExist){
        return response.status(400).json({error: "User already exists"});
    }

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    });

    return response.status(201).json(users[users.length-1]).send();
});  

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const{ user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todosOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

   user.todos.push(todosOperation);

   return response.status(201).json(todosOperation).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todosUpdate = idTodoCheck(user,id);
  if (!todosUpdate) {
    return response.status(404).json({ error: "Task not found"});
  }
  todosUpdate.title = title;
  todosUpdate.deadline = deadline;
  return response.status(200).json(todosUpdate).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params; 
  
  const idCheck = idTodoCheck(user,id);
  if (!idCheck){
    return response.status(404).json({ error: "Task not found"});
  }
  idCheck.done = true;
  return response.status(200).json(idCheck).send();

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params; 
  
  const idCheck = idTodoCheck(user,id);
  if (!idCheck){
    return response.status(404).json({ error: "Task not found"});
  }
    deleted = user.todos.splice(idCheck, 1);

    return response.status(204).json(deleted);
});

module.exports = app;