import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();
      setTodos(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodoTitle.trim()) {
      setError('Please enter a todo title');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTodoTitle,
          expiration_date: expirationDate || null,
        }),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
        setNewTodoTitle('');
        setExpirationDate('');
        setError('');
      } else {
        setError('Failed to create todo');
      }
    } catch (err) {
      setError('Failed to create todo. Make sure the backend is running.');
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      const response = await fetch(`${API_URL}/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== todoId));
        setError('');
      } else {
        setError('Failed to delete todo');
      }
    } catch (err) {
      setError('Failed to delete todo. Make sure the backend is running.');
    }
  };

  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Todo List</h1>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={createTodo} className="todo-form">
          <input
            type="text"
            placeholder="Enter a new todo..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            className="todo-input"
          />
          <input
            type="datetime-local"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="date-input"
            placeholder="Expiration date (optional)"
          />
          <button type="submit" className="add-button">Add Todo</button>
        </form>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="todo-list">
            {todos.length === 0 ? (
              <div className="empty-state">No todos yet. Create one above!</div>
            ) : (
              todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={`todo-item ${isExpired(todo.expiration_date) ? 'expired' : ''}`}
                >
                  <div className="todo-content">
                    <h3>{todo.title}</h3>
                    <div className="todo-meta">
                      <span className="expiration">
                        {isExpired(todo.expiration_date) && '⚠️ '}
                        Expires: {formatDate(todo.expiration_date)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)} 
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

