'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
import { useAuth } from '../context/AuthProvider';

export default function UserDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      let { data, error } = await supabase.from('items').select('*').eq('user_id', user.id);
      if (!error) setItems(data);
    };

    fetchItems();
  }, [user]);

  return (
    <div>
      <h1>Your Items</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name} - {item.description}</li>
        ))}
      </ul>
    </div>
  );
}
