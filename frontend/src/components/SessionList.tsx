'use client';

import React from 'react';
import { Clock, MessageSquare, Code, Trash2, Edit3 } from 'lucide-react';
import { Session } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import useStore from '@/store/useStore';

interface SessionListProps {
  sessions: Session[];
  currentSession: Session | null;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, currentSession }) => {
  const { selectSession, deleteSession, updateSession } = useStore();

  const handleSessionClick = (session: Session) => {
    selectSession(session._id);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleEditSession = async (e: React.MouseEvent, session: Session) => {
    e.stopPropagation();
    const newTitle = prompt('Enter new session title:', session.title);
    if (newTitle && newTitle.trim() !== session.title) {
      try {
        await updateSession(session._id, { title: newTitle.trim() });
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Code className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No sessions yet. Create your first session to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session._id}
          onClick={() => handleSessionClick(session)}
          className={`
            relative p-3 rounded-lg border cursor-pointer transition-all duration-200
            ${
              currentSession?._id === session._id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session.title}
              </h4>
              {session.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {session.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(session.updatedAt)}
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {session.messages?.length || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleEditSession(e, session)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteSession(e, session._id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {session.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
              {session.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  +{session.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SessionList; 