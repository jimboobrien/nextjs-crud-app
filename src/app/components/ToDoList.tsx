'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Button } from 'react-bootstrap';

// Define an interface for the items
interface Item {
  id: string;
  name: string;
  description: string;
  user_id: string;
}

interface ToDoListProps {
  refreshTrigger?: number;
}

export default function ToDoList({ refreshTrigger = 0 }: ToDoListProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch items whenever user or refreshTrigger changes
  useEffect(() => {
    // Don't fetch if auth is still loading or user is not logged in
    if (authLoading || !user) {
      return;
    }

    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch items using the API route with credentials
        const response = await fetch('/api/todos', {
          credentials: 'include', // This ensures cookies are sent with the request
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          
          if (response.status === 401) {
            setError('Your session has expired. Please log in again.');
            console.error('Authentication error:', errorData);
          } else {
            setError(errorData.error || 'Failed to fetch items. Please try again.');
            console.error('API Error:', errorData);
          }
          return;
        }
        
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Unable to connect to the server. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [user, refreshTrigger, authLoading]);

  // Function to delete an item using the API route
  const handleDelete = async (id: string) => {
    if (!user) return;
    
    // Set the deleting state for this item
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    
    try {
      // Delete the item using the API route with credentials
      const response = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE',
        credentials: 'include', // This ensures cookies are sent with the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(errorData.error || 'Failed to delete item. Please try again.');
        }
        return;
      }
      
      // Update the local state to remove the deleted item
      setItems(items.filter(item => item.id !== id));
      
      // Clear any previous errors on successful deletion
      setError(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      // Reset the deleting state
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const renderContent = () => {
    if (authLoading) {
      return <div className="text-center my-3" aria-live="polite">Loading authentication...</div>;
    }
    
    if (isLoading) {
      return <div className="text-center my-3" aria-live="polite">Loading todos...</div>;
    }
    
    if (!user) {
      return <li className="list-group-item text-center">Please log in to view your items</li>;
    }
    
    if (items.length === 0) {
      return <li className="list-group-item text-center">No items yet</li>;
    }
    
    return items.map(item => (
      <li 
        key={item.id} 
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{item.name}</strong>
          {item.description && (
            <p className="mb-0 text-muted">{item.description}</p>
          )}
        </div>
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => handleDelete(item.id)}
          disabled={isDeleting[item.id]}
          aria-label={`Delete ${item.name}`}
        >
          {isDeleting[item.id] ? 'Deleting...' : 'Delete'}
        </Button>
      </li>
    ));
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      
      <ul className="ul-list list-group" aria-label="To-do items list">
        {renderContent()}
      </ul>
    </div>
  );
} 