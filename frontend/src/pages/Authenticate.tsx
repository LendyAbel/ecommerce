import { useState } from 'react';

import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import SlicePanel from '../components/auth/SlicePanel';

const Authenticate = () => {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className='flex h-[calc(100vh-48px)] w-screen items-center justify-center overflow-hidden bg-linear-120 from-[#0f0c29] via-[#302b63] to-[#24243e]'>
            {/* Card container */}
            <div className='relative flex h-130 w-215 overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] shadow-2xl backdrop-blur-md'>
                <Login showLogin={showLogin} />
                <SlicePanel showLogin={showLogin} setShowLogin={setShowLogin} />
                <Register showLogin={showLogin} />
            </div>
        </div>
    );
};

export default Authenticate;
