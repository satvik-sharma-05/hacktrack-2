// src/components/DownloadStatus.jsx
import { useState, useEffect } from 'react';
import { FiDownload, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import { downloadManager } from '../utils/exportUtils';

export default function DownloadStatus() {
  const [downloads, setDownloads] = useState(new Map());

  useEffect(() => {
    const handleDownloadsUpdate = (newDownloads) => {
      setDownloads(new Map(newDownloads));
    };

    downloadManager.addListener(handleDownloadsUpdate);
    return () => downloadManager.removeListener(handleDownloadsUpdate);
  }, []);

  if (downloads.size === 0) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheck className="text-green-400" />;
      case 'failed':
        return <FiX className="text-red-400" />;
      case 'downloading':
        return <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return <FiDownload className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'downloading':
        return 'text-cyan-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {Array.from(downloads.values()).map((download) => (
        <div
          key={download.id}
          className="bg-gray-800 border border-cyan-500/30 rounded-lg p-3 backdrop-blur-md shadow-lg min-w-64 animate-fade-in-up"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(download.status)}
              <span className={`text-sm font-medium ${getStatusColor(download.status)}`}>
                {download.filename}.{download.type}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {download.status === 'downloading' ? `${download.progress}%` : download.status}
            </span>
          </div>
          
          {download.status === 'downloading' && (
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${download.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}