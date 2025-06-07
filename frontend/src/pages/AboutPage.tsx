import React from 'react';
import '../styles/nicepage.css';
import portreit from '../assets/1.jpg';
import galleryImg1 from '../assets/kids1.jpg';
import galleryImg2 from '../assets/kids2.jpg';

const AboutPage: React.FC = () => {
  return (
    <main>
      {/* About Section */}
      <section className="u-clearfix u-section-1" id="about-section" style={{ padding: '60px 20px' }}>
        <div className="u-clearfix u-sheet u-sheet-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
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
              Ja sam Tarik Budimlija, licencirani privatni trener tenisa sa višegodišnjim iskustvom u radu sa djecom, mladima i odraslima.
              Tenis treniram više od 15 godina, a posljednje 4 godine aktivno radim kao trener. Također pohađam fakultet DIF i posjedujem znanje kako oblikovati tijelo kariovaskular STA VEC.
              <br /><br />
              Kroz individualni pristup svakom polazniku, trudim se da časovi tenisa budu zabavni, motivirajući i prilagođeni uzrastu i nivou znanja. Poseban akcenat stavljam na razvoj tehničkih i taktičkih vještina, kao i na izgradnju sportskog duha i samopouzdanja kod djece.
              <br /><br />
              Pored rada sa djecom, rado sarađujem i sa odraslim igračima — bilo da želite unaprijediti svoju igru, steći kondiciju ili pronaći kvalitetnog sparing partnera za dinamične i zanimljive mečeve.
              <br /><br />
              Bez obzira da li ste potpuni početnik ili rekreativac sa ambicijom da napredujete, uz stručno vođstvo i podršku, sigurno ćete uživati na terenu.
              <br /><br />
              Vidimo se na terenu!
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="u-clearfix u-section-2" id="gallery-section" style={{ padding: '40px 20px', backgroundColor: '#f9f9f9' }}>
        <div className="u-clearfix u-sheet u-sheet-1" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <img
              src={galleryImg1}
              alt="Gallery Image 1"
              style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
              Sample Title - Sample Text
            </div>
          </div>

          <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
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
  );
};

export default AboutPage;
