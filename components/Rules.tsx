
import React from 'react';
import type { User, Rule, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';

interface RulesProps {
  navigate: (page: Page) => void;
  currentUser: User;
  rules: Rule[];
  ads: Ad[];
  settings?: AppSettings;
}

export const Rules: React.FC<RulesProps> = ({ navigate, currentUser, rules, ads, settings }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Règlement" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <AdBanner pageName="rules" settings={settings} className="mb-6" />
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white">
            {rules.map(rule => (
                <p key={rule.id}>{rule.content}</p>
            ))}
          </div>
        </div>
        <div className="my-4">
          <AdCarousel ads={ads} />
        </div>
      </main>
    </div>
  );
};
