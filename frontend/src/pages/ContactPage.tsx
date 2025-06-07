import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/nicepage.css';
import contactImage from '../assets/fon.jpeg';

const ContactPage: React.FC = () => {
  return (
    <div className="u-body u-xl-mode">
      <Header />

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '40px',
            alignItems: 'flex-start',
            marginBottom: '40px',
          }}
        >
          {/* Left Image */}
          <div style={{ flex: '0 1 300px', maxWidth: '300px' }}>
            <img
              src={contactImage}
              alt="Contact"
              style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'contain' }}
            />
          </div>

          {/* Right Content */}
          <div
            style={{
              flex: '0 1 400px',
              maxWidth: '400px',
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#333',
              textAlign: 'left',
            }}
          >
            <p style={{ marginBottom: '20px' }}>
              Spremni ste na sljedeći korak? Želite se raspitati, rezervisati termin za sebe ili dijete? Kontaktirajte me na Viber/Whatsapp ili putem poziva sa Vašim pitanjima, a ja ću se potruditi da Vam odgovorim.
            </p>

            <p style={{ marginBottom: '20px' }}>
              Nakon informativnog razgovora ako ste idalje zainteresirani, registirat cemo Vas na stranicu i mozete rezervisati svoj termin online, bez muke, bez zivkanja, poruka, odmah ce Vam na uvidu biti dostupni termini.
            </p>

            {/* Phone button */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#478ac9',
                color: '#fff',
                borderRadius: '6px',
                fontWeight: 'bold',
                marginBottom: '20px',
                cursor: 'pointer',
              }}
            >
              📞 +387 63 039 998
            </div>

            {/* Address button (styled link) */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Setaliste+Slana+Banja,+Tuzla,+75000"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#478ac9',
                color: '#fff',
                borderRadius: '6px',
                fontWeight: 'bold',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              📍 Setaliste Slana Banja, Tuzla, 75000
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
