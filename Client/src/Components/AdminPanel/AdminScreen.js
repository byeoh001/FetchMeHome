import React, { useState } from 'react';
import ReportedListing from './ReportedListing';
import ReportedUsers from './ReportedUsers';
import '../../Styles/AdminScreen.css';

const AdminScreen = () => {
  const [screen, setScreen] = useState('reported-listing');

  return (
    <div className='admin-screen'>
      <div className='admin-content'>
        <div className='admin-sidebar'>
          <h3>Reported Content</h3>
          <ul className='admin-menu'>
            <li className={screen === 'reported-listing' ? 'active' : ''}>
              <button onClick={() => setScreen('reported-listing')}>
                <i className="fa fa-list"></i>
                <span>Reported Listings</span>
              </button>
            </li>
            <li className={screen === 'reported-users' ? 'active' : ''}>
              <button onClick={() => setScreen('reported-users')}>
                <i className="fa fa-user-times"></i>
                <span>Reported Users</span>
              </button>
            </li>
          </ul>
        </div>
        
        <div className='admin-main-content'>
          {screen === 'reported-listing' && <ReportedListing />}
          {screen === 'reported-users' && <ReportedUsers />}
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;