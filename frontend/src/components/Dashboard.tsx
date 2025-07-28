'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, LogOut, User, Sparkles } from 'lucide-react';
import useStore from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SessionList from '@/components/SessionList';
import ChatPanel from '@/components/ChatPanel';
import ComponentPreview from '@/components/ComponentPreview';
import CreateSessionModal from '@/components/modals/CreateSessionModal';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const {
    user,
    sessions,
    currentSession,
    isLoading,
    loadSessions,
    createSession,
    logout,
    setTheme,
    theme,
  } = useStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState(sessions);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSessions(sessions);
    } else {
      const filtered = sessions.filter(
        (session) =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSessions(filtered);
    }
  }, [sessions, searchQuery]);

  const handleCreateSession = async (data: { title: string; description?: string; tags?: string[] }) => {
    try {
      await createSession(data);
      setShowCreateModal(false);
      toast.success('Session created successfully!');
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Component Generator
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Sessions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Sessions</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <SessionList
                    sessions={filteredSessions}
                    currentSession={currentSession}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentSession ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Chat Panel */}
                <div className="xl:col-span-1">
                  <ChatPanel session={currentSession} />
                </div>

                {/* Component Preview */}
                <div className="xl:col-span-1">
                  <ComponentPreview session={currentSession} />
                </div>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Welcome to AI Component Generator
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Create a new session to start generating components with AI
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Session
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSession}
        />
      )}
    </div>
  );
};

export default Dashboard; 