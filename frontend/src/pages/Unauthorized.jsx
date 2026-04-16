import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-500 max-w-md mb-8">
                You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
            </p>
            <Link
                to="/tickets"
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
                Back to Dashboard
            </Link>
        </div>
    );
};

export default Unauthorized;
