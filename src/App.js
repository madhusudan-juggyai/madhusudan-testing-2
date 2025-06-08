import React, { useState, useEffect } from 'react';
import './App.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Header from './components/Header';
import ConversationSummary from './components/ConversationSummary';
import VoiceConversation from './components/VoiceConversation';
import MockInterviewForm from './components/MockInterviewForm';
import WelcomeCreditsModal from './components/WelcomeCreditsModal';
import { vapiService } from './services/vapi';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [authType, setAuthType] = useState('signup');
  const [conversationData, setConversationData] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [vapiInstance, setVapiInstance] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleShowAuth = (type) => {
    setCurrentView('auth');
    setAuthType(type);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
    setShowWelcomeModal(true);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleStartInterview = (prompt, type, additionalData) => {
    setCurrentView('voice-conversation');
    setConversationData({ prompt, type, additionalData });
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setConversationData(null);
    setTranscript('');
    setSummary('');
    setIsCallActive(false);
    setCallStatus('idle');
    setVapiInstance(null);
    setConversationId(null);
    setStartTime(null);
    setElapsedTime(0);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gray-50">
        {currentView === 'landing' && (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Header user={user} onShowAuth={handleShowAuth} onNavigate={handleNavigate} />
            
            <WelcomeCreditsModal 
              isOpen={showWelcomeModal} 
              onClose={() => setShowWelcomeModal(false)}
              onGetStarted={() => handleNavigate('mock-interview-form')}
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
                  Master Your 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> PM Interviews</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Practice product management interviews with AI-powered voice conversations. 
                  Get real-time feedback, improve your storytelling, and land your dream PM role.
                </p>
                
                {user ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={() => handleNavigate('mock-interview-form')}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Start Mock Interview
                    </button>
                    <div className="text-sm text-gray-600">
                      You have <span className="font-semibold text-indigo-600">{user?.credits || 0} credits</span> remaining
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => handleShowAuth('signup')}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Get Started Free
                    </button>
                    <button
                      onClick={() => handleShowAuth('login')}
                      className="border border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {currentView === 'auth' && (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {authType === 'login' ? 'Sign In' : 'Sign Up'}
              </h2>
              
              <GoogleLogin
                onSuccess={handleAuthSuccess}
                onError={() => console.log('Login Failed')}
                useOneTap
              />
              
              <button
                onClick={() => handleNavigate('landing')}
                className="mt-4 text-gray-600 hover:text-gray-800 text-center block"
              >
                Back
              </button>
            </div>
          </div>
        )}
        
        {currentView === 'dashboard' && user && (
          <div className="min-h-screen bg-gray-50">
            <Header user={user} onShowAuth={handleShowAuth} onNavigate={handleNavigate} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome, {user?.name || 'User'}</h2>
                
                <div className="bg-indigo-50 p-6 rounded-lg mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Credits</h3>
                      <p className="text-sm text-gray-600">Remaining interview minutes</p>
                    </div>
                    <div className="text-4xl font-bold text-indigo-600">{user?.credits || 0}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => handleNavigate('mock-interview-form')}
                    className="bg-indigo-600 text-white p-6 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <h3 className="text-xl font-semibold mb-2">Mock Interview</h3>
                    <p className="text-gray-100">Practice with AI-powered mock interviews</p>
                  </button>
                </div>
              </div>
            </main>
          </div>
        )}
        
        {currentView === 'mock-interview-form' && (
          <MockInterviewForm 
            onBack={handleBack}
            onStartInterview={handleStartInterview}
          />
        )}
        
        {currentView === 'voice-conversation' && (
          <VoiceConversation
            user={user}
            conversationData={conversationData}
            setConversationData={setConversationData}
            transcript={transcript}
            setTranscript={setTranscript}
            summary={summary}
            setSummary={setSummary}
            isCallActive={isCallActive}
            setIsCallActive={setIsCallActive}
            callStatus={callStatus}
            setCallStatus={setCallStatus}
            vapiInstance={vapiInstance}
            setVapiInstance={setVapiInstance}
            conversationId={conversationId}
            setConversationId={setConversationId}
            startTime={startTime}
            setStartTime={setStartTime}
            elapsedTime={elapsedTime}
            setElapsedTime={setElapsedTime}
            onBack={handleBack}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
