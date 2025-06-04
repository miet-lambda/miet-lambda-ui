import React, { useState, useEffect } from 'react';
import BalanceDisplay from './BalanceDisplay';
import { auth } from '../services/api';

interface UserProfileProps {
  onLogout?: () => void;
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  balance: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await auth.getCurrentUser();

      if (response.status !== 200) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.data;
      setUserInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleBalanceUpdate = (newBalance: number) => {
    if (userInfo) {
      setUserInfo({ ...userInfo, balance: newBalance });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <i className="fas fa-spinner fa-spin text-2xl text-purple-600"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{userInfo.username}</h2>
              <p className="text-purple-100 mt-1">{userInfo.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="text-white hover:text-purple-100 transition-colors"
            >
              <i className="fas fa-sign-out-alt text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Balance Section */}
          <BalanceDisplay 
            userId={userInfo.id} 
            onBalanceUpdate={handleBalanceUpdate}
          />

          {/* User Info Section */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Username
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {userInfo.username}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {userInfo.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  User ID
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {userInfo.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 