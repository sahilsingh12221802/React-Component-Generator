'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Sparkles, Bot, User, Copy, Download, RefreshCw } from 'lucide-react';
import { Session, Message } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import useStore from '@/store/useStore';
import toast from 'react-hot-toast';

interface ChatPanelProps {
  session: Session;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ session }) => {
  const { addMessage, generateComponent, isGenerating } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating || isStreaming) return;

    const userMessage: Message = {
      _id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    try {
      setInputValue('');
      await addMessage(session._id, userMessage);
      
      // Generate component with streaming
      setIsStreaming(true);
      await generateComponent(session._id, inputValue.trim(), true);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageMessage: Message = {
        _id: Date.now().toString(),
        content: event.target?.result as string,
        role: 'user',
        timestamp: new Date().toISOString(),
        type: 'image',
        fileName: file.name
      };

      try {
        await addMessage(session._id, imageMessage);
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast.error('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyCode = async (message: Message) => {
    if (message.component?.jsx) {
      try {
        await copyToClipboard(message.component.jsx);
        toast.success('Code copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy code');
      }
    }
  };

  const handleDownloadCode = async (message: Message) => {
    if (message.component?.jsx) {
      try {
        const code = `// JSX Component\n${message.component.jsx}\n\n// CSS Styles\n${message.component.css || ''}`;
        downloadFile(`${session.title}-component.jsx`, code);
        toast.success('Code downloaded successfully!');
      } catch (error) {
        toast.error('Failed to download code');
      }
    }
  };

  const handleRegenerate = async (message: Message) => {
    if (isGenerating || isStreaming) return;

    try {
      setIsStreaming(true);
      await generateComponent(session._id, message.content, true);
    } catch (error) {
      console.error('Failed to regenerate:', error);
      toast.error('Failed to regenerate component');
    } finally {
      setIsStreaming(false);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const isAI = message.role === 'assistant';

    return (
      <div
        key={message._id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-primary-600 ml-2' : 'bg-gray-600 mr-2'
          }`}>
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>

          <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              isUser
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}>
              {message.type === 'image' ? (
                <div>
                  <img
                    src={message.content}
                    alt={message.fileName || 'Uploaded image'}
                    className="max-w-full h-auto rounded"
                  />
                  {message.fileName && (
                    <p className="text-xs mt-1 opacity-75">{message.fileName}</p>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {/* Component Actions */}
            {isAI && message.component && (
              <div className="mt-2 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyCode(message)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadCode(message)}
                  className="h-6 px-2 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRegenerate(message)}
                  className="h-6 px-2 text-xs"
                  disabled={isGenerating || isStreaming}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Sparkles className="h-5 w-5 mr-2 text-primary-600" />
          AI Chat
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {session.messages && session.messages.length > 0 ? (
            session.messages.map(renderMessage)
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start a conversation to generate components
              </p>
            </div>
          )}
          
          {(isGenerating || isStreaming) && (
            <div className="flex justify-start mb-4">
              <div className="flex max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 mr-2 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Generating component...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
              disabled={isGenerating || isStreaming}
            >
              <Image className="h-4 w-4" />
            </Button>
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe the component you want to create..."
              className="flex-1"
              disabled={isGenerating || isStreaming}
            />
            
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim() || isGenerating || isStreaming}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <Alert className="mt-3">
            <AlertDescription className="text-xs">
              💡 Tip: You can upload images or describe components in natural language. 
              Try "Create a modern login form" or "Build a responsive navigation bar".
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel; 