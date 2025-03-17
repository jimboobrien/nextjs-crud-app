"use client";
import React, { useState } from 'react';
import config from '../../../../config.json';
import { Card, Row, Col, Container } from 'react-bootstrap';
import ToDoList from '../ToDoList';
import AddItemForm from '../AddItemForm';

const Dashboard: React.FC = () => {
  // Add a state to trigger a refresh of the ToDoList
  const [refreshCount, setRefreshCount] = useState(0);

  // Function to trigger a refresh
  const handleItemAdded = () => {
    // Increment the refresh count to trigger a re-fetch in ToDoList
    setRefreshCount(prev => prev + 1);
  };

  return (
    <Container>
      <h1 className="my-4">{config.app.name} Dashboard</h1>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Todo List</Card.Title>
              <ToDoList refreshTrigger={refreshCount} />
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Add ToDo</Card.Title>
              <AddItemForm onSuccess={handleItemAdded} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
