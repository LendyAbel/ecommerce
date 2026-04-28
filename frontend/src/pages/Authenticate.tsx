import { useState } from 'react';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import SlicePanel from '../components/auth/SlicePanel';

const Authenticate = () => {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className='flex h-[calc(100vh-48px)] w-screen items-center justify-center overflow-hidden bg-bg'>
            <div className='relative flex h-130 w-215 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl'>
                <Login showLogin={showLogin} />
                <SlicePanel showLogin={showLogin} setShowLogin={setShowLogin} />
                <Register showLogin={showLogin} />
            </div>
        </div>
    );
};

export default Authenticate;
