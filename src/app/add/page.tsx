'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '../context/AuthProvider';
//import { useRouter } from 'next/router';

export default function AddItem() {
  const { user } = useAuth();
  //const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleAddItem = async () => {
    if (!name) return alert('Name is required');
    //if (!user) return alert('User is not authenticated');

    const { error } = await supabase.from('items').insert([
      { name, description, user_id: user?.id }
    ]);

    if (error) {
      alert(error.message);
    } else {
      setName('');
      setDescription('');
      //router.push('/test');
      alert('Item added!');
    }
  };

  return (
    <div>
      <h1>Add Item</h1>
      <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
      <button onClick={handleAddItem}>Add</button>
    </div>
  );
}
