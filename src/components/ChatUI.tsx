'use client';

import { useChat } from '@ai-sdk/react';
import Markdown from 'react-markdown';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export default function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit, append } =
    useChat();
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const { watch } = useFormContext();
  const formValues = watch();

  const [stateMessage, setStateMessage] = useState('');

  const scrollToBottom = () => {
    const e = chatBoxRef.current as HTMLDivElement;
    e.scrollTop = e.scrollHeight;
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();

      messages
        .filter((m) => m.role === 'assistant')
        .forEach((message) => {
          const taxObject = getJsonFromChat(message.content);
          if (taxObject) {
            // patchFormUsingTaxObject(taxObject);
          }
        });
    }
  }, [messages]);

  // Add effect to update chat when form values change
  useEffect(() => {
    const stateMessage = `Current calculator state:
- Financial Year: ${formValues.financialYear}
- Salary: ₹${formValues.salary || '0'}
- Business Income: ₹${formValues.businessIncome || '0'}
- Other Income: ₹${formValues.otherIncome || '0'}
- Deductions: ${Object.entries(formValues.deductions || {})
      .map(([key, value]) => `${key}: ₹${value || '0'}`)
      .join(', ')}`;

    setStateMessage(stateMessage);
  }, [formValues]);

  useEffect(() => {
    // append({ role: 'user', content: 'Hi' });
  }, []);

  const getJsonFromChat = (text: string) => {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      try {
        const jsonString = jsonMatch[1];
        const data = JSON.parse(jsonString);
        return data;
      } catch (error) {
        console.error('Failed to parse JSON:', error);
      }
    }
    return null;
  };

  const patchFormUsingTaxObject = () => {};

  return (
    <div className='min-h-screen flex justify-center p-4 bg-gray-50 dark:bg-gray-900'>
      <div className='w-full max-w-4xl h-[70vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden'>
        {/* Header */}
        <div className='p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              AI Tax Assistant
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Using Model - GPT-4
            </p>
        
          </div>
        </div>

        {/* Messages Container */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4' ref={chatBoxRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  m.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                }`}
              >
                <Markdown>{m.content}</Markdown>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className='p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <form onSubmit={handleSubmit}>
            <div className='relative'>
              <input
                className='w-full p-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
                value={input}
                placeholder='Ask me anything about taxes...'
                onChange={handleInputChange}
              />
              <button
                type='submit'
                className='absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-6 h-6'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
