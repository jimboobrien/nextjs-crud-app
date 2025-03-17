'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '../context/AuthProvider';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      let { data, error } = await supabase.from('items').select('*');
      if (!error) setItems(data);
    };

    fetchItems();
  }, [user]);
  if (!user || user.role !== 'admin') return (
    <div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p>Access Denied</p>
    </div>
  );

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name} - {item.description}</li>
        ))}
      </ul>
    </div>
  );
}
