// src/AboutPage.tsx
import React from 'react';
import '../styles/index.css';
import '../styles/nicepage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-6 bg-white shadow">
        <h1 className="text-xl font-bold">O meni</h1>
        <a href="/" className="text-blue-500 hover:underline">Početna</a>
      </header>

      <main className="flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Tarik Budimlija</h2>
          <p className="text-gray-700 leading-relaxed">
            Zovem se Tarik Budimlija i profesionalno se bavim tenisom više od 10 godina.
            Nudim treninge za djecu, rekreativce i starije osobe koje žele unaprijediti svoju igru
            ili jednostavno pronaći sparing partnera.
            Radim sa svakim individualno, pristup prilagođavam vašim ciljevima i mogućnostima.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
