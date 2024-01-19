import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';

import Contracts from './components/Contracts'
import ErrorPage from './components/ErrorPage'

function App() {
  return (
    <div>
      {/* <link rel="icon" href="favicon.png" type="image/x-icon"></link> */}
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Contracts />} />
          <Route path='/contracts' element={<Contracts />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;