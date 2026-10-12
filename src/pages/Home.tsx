import { useState, useEffect, useRef } from 'react';
import CountdownSection from '../components/CountdownSection';
import EventOverview from '../components/EventOverview';
import FAQList from '../components/FAQList';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Code2,
  Atom,
  Users,
  Rocket,
  GraduationCap,
  School,
  ChevronDown,
  Globe2,
  Sparkles,
  Lightbulb,
  Trophy,
  Network,
} from 'lucide-react';
import { ButtonLink, SectionHeading } from '../components/UI';
import { gallery, officialUrl, schedule, venueMapEmbedUrl } from '../data/event';
import { questions } from '../data/quiz';

const scrollGallery = gallery.slice(0, 5);

export default function Home() {
  const reduceMotion = useReducedMotion();
  const motionEnabled = !reduceMotion;
  const [mobileViewport, setMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  );
  const fullText = 'CHALLENGE 2026';
  const [typedText, setTypedText] = useState('');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const activeGalleryIndexRef = useRef(0);
  const gallerySteps = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 800px)');
    const updateViewport = () => setMobileViewport(mobileQuery.matches);
    mobileQuery.addEventListener('change', updateViewport);
    return () => mobileQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [typedText]);

  useEffect(() => {
    const visibleSteps = new Map<HTMLElement, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!(entry.target instanceof HTMLElement)) return;
          if (entry.isIntersecting) visibleSteps.set(entry.target, entry.intersectionRatio);
          else visibleSteps.delete(entry.target);
        });

        const mostVisible = Array.from(visibleSteps.entries()).reduce<
          [HTMLElement, number] | undefined
        >((current, entry) => (!current || entry[1] > current[1] ? entry : current), undefined);
        if (!mostVisible) return;

        const index = gallerySteps.current.indexOf(mostVisible[0]);
        if (index !== -1 && index !== activeGalleryIndexRef.current) {
          activeGalleryIndexRef.current = index;
          setActiveGalleryIndex(index);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    gallerySteps.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`home-page ${motionEnabled ? 'motion-enabled' : 'motion-paused'}`}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-image">
          {motionEnabled && !mobileViewport ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="hero-video"
              src="/video/hero.mp4"
              poster="/img/hero-space.webp"
              preload="metadata"
            />
          ) : (
            <img
              src="/img/hero-space.webp"
              alt=""
              fetchPriority="high"
              loading="eager"
            />
          )}
        </div>
        <div className="hero-shade" />
        <div className="starfield" />
        <div className="hero-content">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.8 }}
          >
            <div className="hero-kicker">
              <span className="live-dot" /> Astroverse X Birla Institute of Applied Sciences
            </div>
            <h1>
              NASA SPACE
              <br />
              APPS
              <br />
              <span className="typing-wrap" aria-label="CHALLENGE 2026">
                <span className="typing-title">{typedText}</span>
              </span>
            </h1>
            <div className="hero-description">
              <p className="hero-subtitle">Big ideas don't belong on one planet.</p>
              <p className="hero-copy">
                Turn curiosity into solutions. Three days of space science,
                <br className="desktop-only" /> collaboration, and possibilities beyond the ordinary.
              </p>
              <div className="hero-meta">
                <span>
                  <CalendarDays size={17} />
                  14–16 NOVEMBER 2026
                </span>
                <span>
                  <MapPin size={17} />
                  BHIMTAL, UTTARAKHAND
                </span>
              </div>
              <div className="hero-actions">
                <ButtonLink external to={officialUrl}>
                  VISIT OFFICIAL NASA SPACE APPS
                </ButtonLink>
                <ButtonLink secondary to="/register">
                  Register your team
                </ButtonLink>
                <ButtonLink secondary external to="https://www.spaceappschallenge.org/2026/challenges/">
                  PROBLEM STATEMENTS
                </ButtonLink>
              </div>
              <a
                className="hero-host"
                href="https://www.birlainstitute.co.in/"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Birla Institute of Applied Sciences website"
              >
                HOSTED BY <span>Birla Institute of Applied Sciences</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Strip */}
      <div className="event-strip">
        <span>
          <Globe2 size={19} /> ONE PLANET. INFINITE POSSIBILITIES.
        </span>
        <span>
          <Code2 size={18} /> BUILD WITH OPEN DATA
        </span>
        <span>
          <Users size={18} /> CREATE TOGETHER
        </span>
        <span>
          <Sparkles size={18} /> THINK BEYOND THE ORDINARY
        </span>
      </div>

      {/* Countdown Section */}
      <CountdownSection />

      {/* Schedule Section - "3 Days" */}
      <section className="section immersive-section home-flight-plan">
        <div className="heading-row">
          <SectionHeading
            eyebrow="YOUR FLIGHT PLAN"
            title="From “what if” to what’s next."
          />
          <Link className="flight-plan-link" to="/venue-schedule">
            Full event schedule <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="flight-plan-grid">
          {schedule.map((day) => {
            const [date, month] = day.date.split(' ');

            return (
              <Link to="/venue-schedule" className="flight-plan-card" key={day.day}>
                <div className="flight-plan-card-header">
                  <div className="flight-plan-date">
                    <strong>{date}</strong>
                    <span>
                      <small>{month === 'NOV' ? 'NOVEMBER' : month}</small>
                      <small>2026</small>
                    </span>
                  </div>
                  <span className="flight-plan-day">DAY {day.day}</span>
                </div>
                <h3>{day.title}</h3>
                <ol className="flight-plan-activities">
                  {day.activities.map((activity, index) => (
                    <li key={activity}>
                      <span className="flight-plan-activity-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ol>
              </Link>
            );
          })}
        </div>
        <p className="flight-plan-note">
          <CalendarDays size={16} aria-hidden="true" />
          Sequence shown for planning. Session details and times remain subject to organizer
          confirmation.
        </p>
      </section>

      {/* Mission Section */}
      <section id="mission" className="section mission-section immersive-section">
        <div>
          <SectionHeading
            eyebrow="OUR SHARED MISSION"
            title={'A global challenge.\nA local community.'}
          />
          <EventOverview />
        </div>
        <div className="event-coordinate">
          <span className="micro-label">NASA INTERNATIONAL SPACE APPS CHALLENGE 2026</span>
          <strong>BHIMTAL</strong>
          <span>14–16 NOVEMBER 2026</span>
          <span>Birla Institute of Applied Sciences</span>
          <iframe
            className="event-coordinate-map"
            title="Mini map locating Birla Institute of Applied Sciences, Bhimtal"
            src={venueMapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* Highlights Section */}
      <section className="section perspective-section immersive-section">
        <div className="perspective-heading">
          <SectionHeading
            eyebrow="MORE THAN A HACKATHON"
            title="Three days. A whole new perspective."
          />
          <Link className="perspective-link" to="/why-participate">
            Why participate? <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="perspective-grid">
          {[
            {
              icon: Trophy,
              number: '01 / RECOGNITION',
              label: 'Participation & recognition',
              title: 'CERTIFICATION',
              text: 'Certificate eligibility and details will be shared once confirmed by the organizers.',
            },
            {
              icon: Sparkles,
              number: '02 / PERKS',
              label: 'Event perks & keepsakes',
              title: 'GOODIES',
              text: 'Any event keepsakes or participant perks are subject to organizer confirmation.',
            },
            {
              icon: Atom,
              number: '03 / EXPLORE',
              label: 'Space science & exploration',
              title: 'FOLLOW YOUR CURIOSITY',
              text: 'Explore new ideas, connect the dots, and turn your curiosity about space into something real.',
            },
            {
              icon: Network,
              number: '04 / CONNECT',
              label: 'Teamwork & networking',
              title: 'CONNECT & COMMUNICATE',
              text: 'Share ideas, communicate clearly, meet new people, and build connections through the event.',
            },
          ].map((item) => (
            <article className="perspective-card" key={item.number}>
              <div className="perspective-card-top">
                <item.icon size={27} aria-hidden="true" />
                <span>{item.number}</span>
              </div>
              <div>
                <span className="perspective-label">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quiz Banner */}
      <section className="quiz-banner section">
        <div className="quiz-invitation">
          <span className="eyebrow">
            <span />A LITTLE CURIOSITY GOES A LONG WAY
          </span>
          <h2>
            A curious mind.
            <br />
            <em>A cosmic challenge.</em>
          </h2>
          <p>
            From planetary rings to rocket science, discover how well you know the universe. Just
            you and your curiosity.
          </p>
          <ButtonLink to="/quiz">Take the space quiz</ButtonLink>
          <span className="quiz-access-note">No registration needed. Explore at your own pace.</span>
        </div>
        <div className="quiz-brief">
          <div className="quiz-brief-heading">
            <span className="micro-label">YOUR MISSION BRIEF</span>
            <Rocket size={25} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="quiz-question-count">
            <strong>{questions.length}</strong>
            <span>
              questions.
              <br />
              One universe to explore.
            </span>
          </div>
          <div className="quiz-brief-row">
            <Atom size={20} aria-hidden="true" />
            <span>Space, science & discovery</span>
          </div>
          <div className="quiz-brief-row">
            <Lightbulb size={20} aria-hidden="true" />
            <span>Learn something with every answer</span>
          </div>
          <div className="quiz-brief-row">
            <Sparkles size={20} aria-hidden="true" />
            <span>Instant results, endless curiosity</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories immersive-section">
        <SectionHeading
          eyebrow="THINK. SOLVE. INNOVATE."
          title="CHALLENGE YOUR MIND"
        >
          Different starting points. The same limitless curiosity.
        </SectionHeading>
        <div className="category-grid">
          <Link to="/school" className="category-card">
            <School size={32} />
            <span className="micro-label">FOR THE NEXT GENERATION</span>
            <h3>School Category</h3>
            <p>Put your curiosity to work with science, logic, creativity and teamwork.</p>
            <span className="arrow-link">
              Find your starting point <ArrowUpRight size={19} />
            </span>
            <div className="category-orb" />
          </Link>
          <Link to="/college" className="category-card college">
            <GraduationCap size={32} />
            <span className="micro-label">FOR TOMORROW'S PROBLEM-SOLVERS</span>
            <h3>College Category</h3>
            <p>Turn technical skills and bold ideas into real-world solutions.</p>
            <span className="arrow-link">
              Build your next big idea <ArrowUpRight size={19} />
            </span>
            <div className="category-orb" />
          </Link>
        </div>
      </section>

      {/* Scroll Gallery */}
      <section className="section home-gallery immersive-section">
        <div className="home-gallery-heading">
          <SectionHeading
            eyebrow="REAL PEOPLE. REAL POSSIBILITIES."
            title="A glimpse of the journey."
          >
            Scroll through moments from the organizer-supplied event archive.
          </SectionHeading>
          <Link className="arrow-link" to="/gallery">
            View event gallery <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="gallery-story">
          <figure className="gallery-story-stage" aria-live="polite">
            <motion.img
              key={scrollGallery[activeGalleryIndex].src}
              className="gallery-story-image"
              src={scrollGallery[activeGalleryIndex].src}
              alt={scrollGallery[activeGalleryIndex].caption}
              loading="lazy"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeInOut' }}
            />
          </figure>
          <div className="gallery-story-steps">
            {scrollGallery.map((image, index) => (
              <article
                className={`gallery-story-step ${
                  activeGalleryIndex === index ? 'is-active' : ''
                }`}
                data-gallery-index={index}
                key={image.src}
                ref={(element) => {
                  gallerySteps.current[index] = element;
                }}
                aria-current={activeGalleryIndex === index ? 'step' : undefined}
              >
                <span className="micro-label">
                  {String(index + 1).padStart(2, '0')} / EVENT MOMENT
                </span>
                <h3>{image.caption}</h3>
              </article>
            ))}
          </div>
        </div>
        <p className="fine-print">
          Genuine photographs supplied by the organizers. Archive dates and detailed captions are
          awaiting confirmation.
        </p>
      </section>

      {/* Organizer Section */}
      <section className="organizer-section section immersive-section">
        <div className="organizer-orbit">
          <img
            className="organizer-logo"
            src="/img/my-logo.png.png"
            alt="Birla Institute of Applied Sciences logo"
            loading="lazy"
          />
        </div>
        <div>
          <span className="eyebrow">
            <span />
            ORGANISED BY
          </span>
          <h2>
            Birla Institute of
            <br />
            Applied Sciences
          </h2>
          <p>Bhimtal, Uttarakhand, India</p>
          <Link to="/venue" className="arrow-link">
            A remarkable setting for remarkable ideas <ArrowUpRight size={18} />
          </Link>
        </div>
        <span className="organizer-badge">
          SCIENCE.
          <br />
          COLLABORATION.
          <br />
          POSSIBILITY.
        </span>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section home-faq immersive-section">
        <SectionHeading eyebrow="MISSION BRIEFING" title="Good questions. Clear answers.">
          Everything we know so far. Unconfirmed policies are marked transparently.
        </SectionHeading>
        <FAQList />
        <ButtonLink to="/contact" secondary>
          Contact & venue information
        </ButtonLink>
      </section>

      {/* Final CTA Section */}
      <section className="section final-cta immersive-section">
        <span className="eyebrow">
          <span />
          THE NEXT CHAPTER STARTS WITH YOU
        </span>
        <h2>
          Your mind is the
          <br />
          <em>most powerful spacecraft.</em>
        </h2>
        <p>Bring your ideas. Find your team. Make your mark.</p>
        <ButtonLink to="/register">Join the mission</ButtonLink>
        <Link to="/why-participate" className="arrow-link">
          Why participate? <ArrowUpRight size={17} />
        </Link>
      </section>
    </div>
  );
}
