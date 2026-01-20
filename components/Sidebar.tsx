
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: AppTab.DASHBOARD, icon: 'fa-gauge-high', label: 'Dashboard' },
    { id: AppTab.SEARCH, icon: 'fa-globe', label: 'Search Index' },
    { id: AppTab.SMART_INFO, icon: 'fa-magnifying-glass-chart', label: 'Smart Info' },
    { id: AppTab.CREATIVE, icon: 'fa-wand-magic-sparkles', label: 'Creative Lab' },
    { id: AppTab.HELP, icon: 'fa-circle-question', label: 'Help' },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-cloud-arrow-down text-white text-xl"></i>
          </div>
          <span className="font-bold text-lg tracking-tight">CloudTorr<span className="text-blue-500">AI</span></span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 font-medium'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Storage Usage</p>
          <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-[10px] text-gray-400">65GB of 100GB Used</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
