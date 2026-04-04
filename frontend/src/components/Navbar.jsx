import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AuthContext from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const displayName = user?.name || user?.fullName || user?.email || 'U';
  const firstInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    setOpen(false);
  }, [user]);

  const baseLinkClass = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDdiZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1icmllZmNhc2UtaWNvbiBsdWNpZGUtYnJpZWZjYXNlIj48cGF0aCBkPSJNMTYgMjBWNGEyIDIgMCAwIDAtMi0yaC00YTIgMiAwIDAgMC0yIDJ2MTYiLz48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHg9IjIiIHk9IjYiIHJ4PSIyIi8+PC9zdmc+"
                alt="Logo"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded-md"
              />
              <span className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">JobNestle</span>
            </NavLink>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {!user && (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `${baseLinkClass} ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `${baseLinkClass} ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `${baseLinkClass} ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-blue-500/90 hover:bg-blue-600 text-white'
                    } shadow-sm`
                  }
                >
                  Register
                </NavLink>
              </>
            )}

            {user && (
              <>
                <NavLink
                  to="/jobs"
                  className={({ isActive }) =>
                    `${baseLinkClass} ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`
                  }
                >
                  Jobs
                </NavLink>
                <NavLink
                  to="/client"
                  className={({ isActive }) =>
                    `${baseLinkClass} ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/my-jobs"
                  className={({ isActive }) =>
                    `${baseLinkClass} ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`
                  }
                >
                  My jobs
                </NavLink>
                <NavLink
                  to="/applications/received"
                  className={({ isActive }) =>
                    `${baseLinkClass} ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`
                  }
                >
                  Applications
                </NavLink>
                <NavLink
                  to="/jobs/create"
                  className={({ isActive }) =>
                    `${baseLinkClass} ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } rounded-md`
                  }
                >
                  Post job
                </NavLink>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex flex-col items-end text-right">
                  <div className="text-sm md:text-base font-semibold text-gray-900 truncate max-w-[160px]">
                    {displayName}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center font-semibold shadow-sm">
                  {firstInitial}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 px-2"
                >
                  Log out
                </button>
              </div>
            )}

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${open ? 'block' : 'hidden'} md:hidden bg-white border-t shadow-sm`}>
        <div className="px-5 py-4 space-y-2">
          {!user && (
            <>
              <NavLink to="/" onClick={() => setOpen(false)} className={`${baseLinkClass} block`}>
                Home
              </NavLink>
              <NavLink to="/login" onClick={() => setOpen(false)} className={`${baseLinkClass} block`}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setOpen(false)}
                className="block bg-blue-600 text-white px-3 py-2 rounded-md text-center"
              >
                Register
              </NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to="/jobs" onClick={() => setOpen(false)} className={`${baseLinkClass} block`}>
                Jobs
              </NavLink>
              <NavLink to="/client" onClick={() => setOpen(false)} className={`${baseLinkClass} block`}>
                Dashboard
              </NavLink>
              <NavLink to="/my-jobs" onClick={() => setOpen(false)} className={`${baseLinkClass} block`}>
                My jobs
              </NavLink>
              <NavLink to="/applications/received" onClick={() => setOpen(false)} className={`${baseLinkClass} block`}>
                Applications
              </NavLink>
              <NavLink to="/jobs/create" onClick={() => setOpen(false)} className={`${baseLinkClass} block`}>
                Post job
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 text-red-600 text-sm font-medium"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
