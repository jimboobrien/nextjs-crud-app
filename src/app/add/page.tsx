'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '../context/AuthProvider';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
//import { useRouter } from 'next/router';

export default function AddItem() {
  const { user } = useAuth();
  //const router = useRouter();
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
    
    setIsSubmitting(true);
    setFeedback({ message: '', type: '' });

    const { error } = await supabase.from('items').insert([
      { name, description, user_id: user?.id }
    ]);

    setIsSubmitting(false);
    
    if (error) {
      setFeedback({ message: error.message, type: 'danger' });
    } else {
      setName('');
      setDescription('');
      setFeedback({ message: 'Item added successfully!', type: 'success' });
      //router.push('/test');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow p-5">
            <Card.Header as="h4" className="bg-primary text-white p-2">
              Add New Item
            </Card.Header>
            <Card.Body>
              {feedback.message && (
                <Alert variant={feedback.type} dismissible onClose={() => setFeedback({ message: '', type: '' })}>
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
        </Col>
      </Row>
    </Container>
  );
}
