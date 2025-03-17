'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

interface AddItemFormProps {
  onSuccess?: () => void;
}

export default function AddItemForm({ onSuccess }: AddItemFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name) {
      setFeedback({ message: 'Name is required', type: 'danger' });
      return;
    }
    
    if (!user) {
      setFeedback({ message: 'You must be logged in to add items', type: 'danger' });
      return;
    }
    
    setIsSubmitting(true);
    setFeedback({ message: '', type: '' });

    try {
      // Add item using the API route with credentials
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent with the request
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item');
      }

      const data = await response.json();
      
      setName('');
      setDescription('');
      setFeedback({ message: 'Item added successfully!', type: 'success' });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setFeedback({ 
        message: error instanceof Error ? error.message : 'Failed to add item', 
        type: 'danger' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow p-5">
      <Card.Header as="h4" className="bg-primary text-white p-2">
        Add New Item
      </Card.Header>
      <Card.Body>
        {feedback.message && (
          <Alert variant={feedback.type as any} dismissible onClose={() => setFeedback({ message: '', type: '' })}>
            {feedback.message}
          </Alert>
        )}
        
        <Form onSubmit={handleAddItem}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter item name" 
              value={name}
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              placeholder="Enter item description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)} 
            />
          </Form.Group>
          
          <div className="d-grid">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
} 