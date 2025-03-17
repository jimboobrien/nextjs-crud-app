'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Button, Dropdown, DropdownButton, ButtonGroup } from 'react-bootstrap';
import { supabase } from '../../utils/supabase';

// Define an interface for the items
interface Item {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
}

// Define sort options
type SortField = 'name' | 'description' | 'created_at';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
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
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Define sort options
  const sortOptions: SortOption[] = [
    { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
    { field: 'name', direction: 'desc', label: 'Name (Z-A)' },
    { field: 'description', direction: 'asc', label: 'Description (A-Z)' },
    { field: 'description', direction: 'desc', label: 'Description (Z-A)' },
    { field: 'created_at', direction: 'desc', label: 'Newest First' },
    { field: 'created_at', direction: 'asc', label: 'Oldest First' },
  ];

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
        // Fetch items directly from Supabase
        const { data, error: supabaseError } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          setError(supabaseError.message || 'Failed to fetch items. Please try again.');
          return;
        }
        
        setItems(data || []);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Unable to connect to the server. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [user, refreshTrigger, authLoading, sortField, sortDirection]);

  // Function to handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortField(option.field);
    setSortDirection(option.direction);
  };

  // Function to delete an item directly using Supabase
  const handleDelete = async (id: string) => {
    if (!user) return;
    
    // Set the deleting state for this item
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    
    try {
      // Delete the item directly from Supabase
      const { error: supabaseError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError(supabaseError.message || 'Failed to delete item. Please try again.');
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

  // Get current sort option label
  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(
      option => option.field === sortField && option.direction === sortDirection
    );
    return currentOption ? currentOption.label : 'Sort by';
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
          <small className="text-muted">
            {new Date(item.created_at).toLocaleString()}
          </small>
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
      
      {user && items.length > 0 && (
        <div className="d-flex justify-content-end mb-3">
          <DropdownButton
            as={ButtonGroup}
            title={`Sort by: ${getCurrentSortLabel()}`}
            variant="outline-secondary"
            size="sm"
          >
            {sortOptions.map((option, index) => (
              <Dropdown.Item 
                key={index} 
                onClick={() => handleSortChange(option)}
                active={sortField === option.field && sortDirection === option.direction}
              >
                {option.label}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </div>
      )}
      
      <ul className="ul-list list-group" aria-label="To-do items list">
        {renderContent()}
      </ul>
    </div>
  );
} 