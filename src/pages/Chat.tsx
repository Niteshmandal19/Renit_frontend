import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Chat = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${itemId}/`);
    setWs(websocket);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data.message]);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/messages/?item_id=${itemId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();

    return () => {
      websocket.close();
    };
  }, [itemId]);

  const handleSend = async () => {
    if (!receiverId) {
      alert('Please specify a receiver ID');
      return;
    }
    if (ws) {
      ws.send(JSON.stringify({ content, receiver_id: receiverId }));
      await axios.post('http://localhost:8000/api/messages/', {
        item: itemId,
        receiver: receiverId,
        content,
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setContent('');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Chat</Typography>
      <TextField
        label="Receiver ID (temporary)"
        type="number"
        value={receiverId || ''}
        onChange={(e) => setReceiverId(Number(e.target.value))}
        fullWidth
        margin="normal"
      />
      <List>
        {messages.map(msg => (
          <ListItem key={msg.id}>
            <ListItemText primary={`${msg.sender} to ${msg.receiver}: ${msg.content}`} secondary={msg.timestamp} />
          </ListItem>
        ))}
      </List>
      <TextField
        label="Message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={handleSend}>Send</Button>
    </Container>
  );
};

export default Chat;