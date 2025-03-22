const App = () => {
  const [view, setView] = React.useState('login');
  const [apiKeys, setApiKeys] = React.useState([]);
  const [message, setMessage] = React.useState(null);
  const [formData, setFormData] = React.useState({
    username: '',
    password: ''
  });

  const setToken = (token) => {
    localStorage.setItem('token', token);
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  React.useEffect(() => {
    const token = getToken();
    if (token) {
      setView('dashboard');
      fetchApiKeys();
    }
  }, []);

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      const response = await fetch(`/auth/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        if (type === 'login' && data.token) {
          setToken(data.token);
          setView('dashboard');
          fetchApiKeys();
        }
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.api_keys || []);
      } else if (response.status === 401) {
        setView('login');
        localStorage.removeItem('token');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch API keys.' });
    }
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch('/api/generate-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        fetchApiKeys();
        setMessage({ type: 'success', text: 'New API key generated!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate API key.' });
    }
  };

  const revokeApiKey = async (key) => {
    try {
      const response = await fetch(`/api/revoke/${key}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        fetchApiKeys();
        setMessage({ type: 'success', text: 'API key revoked successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to revoke API key.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setView('login');
    setApiKeys([]);
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'API key copied to clipboard!' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {message && (
          <div className={`p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {view === 'login' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <div className="space-x-4">
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Login
                </button>
                <button type="button" onClick={() => setView('register')} className="px-4 py-2 text-blue-500">
                  Register instead
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'register' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <div className="space-x-4">
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Register
                </button>
                <button type="button" onClick={() => setView('login')} className="px-4 py-2 text-blue-500">
                  Login instead
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">API Keys Dashboard</h2>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
            <button
              onClick={generateApiKey}
              className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
            >
              <i className="fas fa-key"></i>
              Generate New API Key
            </button>

            <div className="space-y-4">
              {apiKeys.map((keyData, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <code className="font-mono text-sm">{keyData.key}</code>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {new Date(keyData.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => copyToClipboard(keyData.key)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    <button
                      onClick={() => revokeApiKey(keyData.key)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <p className="text-center text-gray-500">No API keys generated yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));