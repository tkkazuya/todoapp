'use client';

import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

export default function TodoApp() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, input]);
    setInput('');
  };

  const deleteTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(todos[index]);
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    const newTodos = [...todos];
    newTodos[editIndex] = editValue;
    setTodos(newTodos);
    setEditIndex(null);
    setEditValue('');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="新しいTodo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={addTodo}>
          追加
        </Button>
      </Box>
      <List>
        {todos.map((todo, index) => (
          <ListItem
            key={index}
            secondaryAction={
              editIndex === index ? (
                <IconButton edge="end" onClick={saveEdit}>
                  <SaveIcon />
                </IconButton>
              ) : (
                <>
                  <IconButton edge="end" onClick={() => startEdit(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => deleteTodo(index)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )
            }
          >
            {editIndex === index ? (
              <TextField
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                fullWidth
              />
            ) : (
              <ListItemText primary={todo} />
            )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
