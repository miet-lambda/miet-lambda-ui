import React, { useState, useEffect } from 'react';
import { auth } from '../services/api';

interface BalanceDisplayProps {
  userId: number;
  onBalanceUpdate?: (newBalance: number) => void;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ userId, onBalanceUpdate }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchBalance = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await auth.getCurrentUser();

      if (response.status !== 200) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }

      const data = await response.data;

      const balance = Number(data.money_balance);

      setBalance(balance);
      if (onBalanceUpdate) {
        onBalanceUpdate(balance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      console.error('Balance fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsAdding(true);
    setError(null);
    try {
      const response = await auth.addMoney(userId, Number(amount));

      if (response.status !== 200) {
        const errorData = await response.data;
        throw new Error(errorData.message || 'Failed to add money');
      }

      await fetchBalance();
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add money');
      console.error('Add money error:', err);
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lambda Coins</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : balance !== null ? (
              `${balance} LC`
            ) : (
              '---'
            )}
          </p>
        </div>
        <button
          onClick={fetchBalance}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          disabled={isLoading}
        >
          <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Add Lambda Coins
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
              min="1"
              disabled={isAdding}
            />
            <button
              onClick={handleAddMoney}
              disabled={isAdding || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
              className={`${
                isAdding || !amount || isNaN(Number(amount)) || Number(amount) <= 0
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
            >
              {isAdding ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceDisplay; 