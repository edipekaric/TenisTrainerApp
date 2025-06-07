// src/ContactPage.tsx
import React from 'react';
import '../styles/index.css';

const ContactPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-6 bg-white shadow">
        <h1 className="text-xl font-bold">Kontakt</h1>
        <a href="/" className="text-blue-500 hover:underline">Početna</a>
      </header>

      <main className="flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ime i prezime</label>
              <input type="text" className="mt-1 block w-full border rounded p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 block w-full border rounded p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Poruka</label>
              <textarea className="mt-1 block w-full border rounded p-2" rows={4}></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Pošalji poruku
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
