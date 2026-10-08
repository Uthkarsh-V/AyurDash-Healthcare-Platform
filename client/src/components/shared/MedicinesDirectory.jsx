import React, { useState, useEffect } from 'react';
import * as api from '../../api';

export default function MedicinesDirectory() {
  const [medicines, setMedicines] = useState([]);
  
  useEffect(() => {
    // Fetch medicines
    // api.getMedicines().then(res => setMedicines(res.data));
  }, []);

  return (
    <div className="view" id="view-medicines">
      <div className="view-header">
        <h2>Medicines Directory</h2>
      </div>
      <div className="view-body">
        <p>Medicines list will go here.</p>
      </div>
    </div>
  );
}
