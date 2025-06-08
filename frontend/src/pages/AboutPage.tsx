import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/nicepage.css';
import portreit from '../assets/1.jpg';
import galleryImg1 from '../assets/kids1.jpg';
import galleryImg2 from '../assets/kids2.jpg';

const AboutPage: React.FC = () => {
  return (
    <div className="u-body u-xl-mode">
      <Header />

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* About Section */}
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
          {/* Left Image */}
          <div style={{ flex: '1 1 300px', maxWidth: '500px' }}>
            <img
              src={portreit}
              alt="Tarik Budimlija"
              style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
            />
          </div>

          {/* Right Text */}
          <div style={{ flex: '1 1 300px', maxWidth: '600px', fontSize: '1rem', lineHeight: '1.6', color: '#333' }}>
            <p>
              Ja sam Tarik Budimlija, student fakulteta tjelesnog odgoja i sporta, licencirani privatni trener tenisa sa višegodišnjim iskustvom u radu sa djecom, mladima i odraslima. Tenis treniram više od 15 godina, a posljednje 4 godine radim aktivno kao trener.
              <br /><br />
              Individualnim pristupom tenis postaje zabavan, jer su treninzi posebno krojeni uzrastu i nivou znanja. Poseban akcenat stavljam na razvoj tehničkih i taktičkih vještina, kao i na izgradnju sportskog duha i samopouzdanja kod djece
              <br /><br />
              Pored rada sa djecom, sarađujem i sa odraslim igračima — unapređujući igru, kondiciju i životni stil sa dinamičnim i zanimljivim mečevima.
              <br /><br />
              Bez obzira da li ste potpuni početnik ili rekreativac sa željom da napredujete, uz stručno vođstvo i podršku ćete uživati u svakom momentu vašeg razvoja.
              <br /><br />
              Vidimo se na terenu!
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', textAlign: 'center' }}>Galerija</h2>
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '20px',
              paddingBottom: '10px',
            }}
          >
            <div style={{ flex: '0 0 auto', width: '300px' }}>
              <img
                src={galleryImg1}
                alt="Gallery Image 1"
                style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
                Sample Title - Sample Text
              </div>
            </div>

            <div style={{ flex: '0 0 auto', width: '300px' }}>
              <img
                src={galleryImg2}
                alt="Gallery Image 2"
                style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
                Sample Title - Sample Text
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
