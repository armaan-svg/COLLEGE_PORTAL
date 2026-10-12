import EventOverview from '../components/EventOverview';
import FAQList from '../components/FAQList';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Code2,
  Lightbulb,
  Atom,
  Cpu,
  Users,
  MessageCircle,
  Wrench,
  Target,
  Presentation,
  Network,
  MapPin,
  CalendarDays,
  ArrowUpRight,
} from 'lucide-react';
import { ButtonLink, Notice, PageIntro, SpaceArt } from '../components/UI';
import { directionsUrl, officialUrl, schedule } from '../data/event';
import { approvedVideos, launchMedia } from '../data/media';
import MediaPlayer from '../components/MediaPlayer';
import { OptimizedImage } from '../components/UI';

export function About() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="OUR SHARED MISSION"
        title="Great questions bring us together."
      >
        NASA International Space Apps Challenge 2026
      </PageIntro>
      <div className="split-content">
        <div>
          <h2>
            A global challenge.
            <br />
            A local community.
          </h2>
          <EventOverview />
        </div>
        <SpaceArt />
      </div>
    </div>
  );
}

export function Highlights() {
  const items = [
    [Code2, 'Hackathon', 'Collaborative building around real-world questions.'],
    [Lightbulb, 'Innovation', 'Fresh perspectives and creative solutions.'],
    [Atom, 'Space science', 'Scientific questions with everyday relevance.'],
    [Cpu, 'Technology', 'Data, software and thoughtful technical design.'],
    [Users, 'Teamwork', 'Different skills, one shared goal.'],
    [MessageCircle, 'Mentorship', 'Guided learning sessions, subject to confirmation.'],
    [Wrench, 'Workshops', 'Hands-on sessions, subject to confirmation.'],
    [Target, 'Challenges', 'Open-data problem-solving and research.'],
    [Presentation, 'Presentations', 'Share the story behind your ideas.'],
    [Network, 'Networking', 'Meet a community of curious minds.'],
  ] as const;

  return (
    <div className="page">
      <PageIntro
        eyebrow="THE EXPERIENCE"
        title="Built around possibility."
      >
        A proposed programme of learning, making and collaboration. Specific
        sessions and activities remain subject to organizer confirmation.
      </PageIntro>
      <div className="feature-grid public-features">
        {items.map(([Icon, title, text]) => (
          <article className="feature-card" key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <ButtonLink to="/register">Register your interest</ButtonLink>
    </div>
  );
}

export function Schedule() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="14–16 NOVEMBER 2026"
        title="Your three-day flight plan."
      >
        Birla Institute of Applied Sciences · Bhimtal, Uttarakhand
      </PageIntro>
      <div className="timeline">
        {schedule.map((day) => (
          <article className="timeline-day" key={day.day}>
            <div>
              <span className="eyebrow">DAY {day.day}</span>
              <h2>
                {day.date}
                <small>2026</small>
              </h2>
            </div>
            <div>
              <h3>{day.title}</h3>
              {day.activities.map((activity) => (
                <div className="timeline-item" key={activity}>
                  <span className="timeline-dot" />
                  <span>{activity}</span>
                  <small>Time pending</small>
                </div>
              ))}
              <p className="fine-print">{day.note}</p>
            </div>
          </article>
        ))}
      </div>
      <Notice>
        The closing ceremony is scheduled for 16 November 2026, the third and
        final day. No ceremony time, guest or award programme has been
        confirmed.
      </Notice>
      <ButtonLink to="/venue" secondary>
        View the venue & directions
      </ButtonLink>
    </div>
  );
}

export function Venue() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="IN THE HILLS OF BHIMTAL"
        title="A place for a new perspective."
      >
        Birla Institute of Applied Sciences, Bhimtal, Uttarakhand, India.
      </PageIntro>
      <div className="venue-grid">
        <div>
          <h2>
            Birla Institute of
            <br />
            Applied Sciences
          </h2>
          <p>
            <MapPin size={17} /> Bhimtal 263136, Uttarakhand, India
          </p>
          <p>
            <CalendarDays size={17} /> 14–16 November 2026
          </p>
          <p>
            The directions destination is sourced from the institute's own
            website. Please confirm arrival and check-in instructions with the
            organizers before travelling.
          </p>
          <ButtonLink external to={directionsUrl}>
            Get directions
          </ButtonLink>
          <a
            className="arrow-link"
            href="https://birlainstitute.co.in/"
            target="_blank"
            rel="noreferrer"
          >
            Institute website <ArrowUpRight size={17} />
          </a>
        </div>
        <iframe
          title="Birla Institute of Applied Sciences, Bhimtal map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3477.4607286853357!2d79.55042308813083!3d29.356796190712274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a09818f8b9c99f%3A0xfe9870c9d2a28be7!2sBirla%20Institute%20Of%20Applied%20Sciences!5e0!3m2!1sen!2sin!4v1583690649149!5m2!1sen!2sin"
        />
      </div>
    </div>
  );
}

export function Certification() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="RECOGNISING YOUR JOURNEY"
        title="Your work. Your learning."
      >
        Certificate information for participants.
      </PageIntro>
      <div className="split-content certificate-section">
        <div>
          <h2>
            Meaningful participation.
            <br />
            Clear information.
          </h2>
          <p>
            Certificate eligibility, issuing authority, delivery process and
            availability have not yet been confirmed by the organizers.
          </p>
          <Notice>
            Certificate information will be announced here. There are currently
            no certificate records, downloads or certificate-verification
            services.
          </Notice>
          <p>
            Your registration QR code verifies your event registration only. It
            is not a certificate of participation or an official NASA credential.
          </p>
          <ButtonLink to="/dashboard" secondary>
            View your registration
          </ButtonLink>
        </div>
        <div className="certificate-art">
          <Atom size={54} />
          <span>ASTROVERSE</span>
          <h3>
            A journey of
            <br />
            curiosity.
          </h3>
          <div className="certificate-lines" />
          <small>
            CERTIFICATION INFORMATION
            <br />
            AWAITING ORGANIZER CONFIRMATION
          </small>
        </div>
      </div>
    </div>
  );
}

export function Category({ category }: { category: 'school' | 'college' }) {
  const school = category === 'school';

  return (
    <div className="page">
      <PageIntro
        eyebrow="CHALLENGE YOUR MIND"
        title={`${school ? 'School' : 'College'} Category`}
      >
        {school
          ? 'A universe of questions. A generation of possibilities.'
          : 'Technical curiosity meets real-world problem-solving.'}
      </PageIntro>
      <div className="split-content">
        <div>
          <h2>Think. Solve. Innovate.</h2>
          <p>
            {school
              ? 'Develop scientific awareness, logical reasoning, aptitude and creative problem-solving alongside your team.'
              : 'Bring together technical skills, open-data thinking and teamwork to develop original solutions and strengthen your portfolio.'}
          </p>
          <p>
            Eligibility boundaries, category-specific sessions, team-size policy
            and participation rules are pending organizer confirmation. The
            provisional team limit is 4–6, configurable by authorized organizers.
          </p>
          <Notice>
            No registration or participation payment is collected. Free
            participation for this category is proposed and awaiting organizer
            confirmation.
          </Notice>
          <h3>How to get started</h3>
          <p>
            Create and verify an account, choose the {school ? 'School' : 'College'}{' '}
            category, and submit team details when registration opens.
          </p>
          <ButtonLink to={`/register?category=${category}`}>
            Register in this category
          </ButtonLink>
        </div>
        <SpaceArt kind={school ? 'planet' : 'nebula'} />
      </div>
    </div>
  );
}

export function WhyParticipate() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="THE VALUE IS IN THE JOURNEY"
        title="Leave with a new perspective."
      >
        Real learning. New connections. Work you can be proud of.
      </PageIntro>
      <div className="feature-grid public-features">
        {[
          'Collaboration',
          'Scientific learning',
          'Technical experience',
          'Problem-solving',
          'Portfolio development',
          'Networking',
          'Creativity',
          'Open-data challenges',
          'Innovation',
        ].map((item, index) => (
          <article className="feature-card" key={item}>
            <span className="eyebrow">0{index + 1}</span>
            <h3>{item}</h3>
            <p>
              Build practical experience through shared questions, thoughtful
              experimentation and working with a team.
            </p>
          </article>
        ))}
      </div>
      <Notice>
        Participation does not guarantee awards, certificates, internships,
        employment or selection in any global programme.
      </Notice>
      <ButtonLink to="/register">Take the first step</ButtonLink>
    </div>
  );
}

export function FAQ() {
  return (
    <div className="page faq-page">
      <PageIntro
        eyebrow="MISSION BRIEFING"
        title="Good questions. Clear answers."
      >
        Everything we know so far. Unconfirmed policies are marked
        transparently.
      </PageIntro>
      <FAQList />
      <ButtonLink to="/contact" secondary>
        Contact & venue information
      </ButtonLink>
    </div>
  );
}

export function Contact() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="MISSION CONTROL"
        title="Let's connect."
      >
        NASA International Space Apps Challenge 2026 ·
      </PageIntro>
      <div className="panel">
        <h2>Birla Institute of Applied Sciences</h2>
        <p>Bhimtal, Uttarakhand, India</p>
        <p>Local programme: 14–16 November 2026</p>
        <Notice>
          Event-specific email addresses, phone numbers and social accounts
          have not been supplied or verified. Contact details will appear here
          once approved by the organizers.
        </Notice>
        <ButtonLink external to="https://birlainstitute.co.in/">
          Visit the host institution
        </ButtonLink>
        <ButtonLink to="/venue" secondary>
          Venue & map
        </ButtonLink>
      </div>
    </div>
  );
}

export function Media() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="A WINDOW INTO SPACE"
        title="Beyond our atmosphere."
      >
        External illustrative space media is separate from genuine local event
        footage.
      </PageIntro>

      <figure className="launch-visual">
        <OptimizedImage
          src={launchMedia.src}
          alt="A SpaceX Falcon 9 rocket launching the Crew-9 Dragon spacecraft on 28 September 2024"
        />
        <figcaption>
          <div>
            <span className="eyebrow">ILLUSTRATIVE EXTERNAL MEDIA</span>
            <h2>{launchMedia.title}</h2>
            <p>{launchMedia.caption}</p>
          </div>
          <div>
            <span>{launchMedia.credit}</span>
            <a href={launchMedia.source} target="_blank" rel="noreferrer">
              View NASA source <ArrowUpRight size={15} />
            </a>
          </div>
        </figcaption>
      </figure>

      <div className="media-grid">
        <div className="panel">
          <SpaceArt kind="nebula" />
          <h2>Black Nova / Nebula</h2>
          <p>
            An original, lightweight animated visualization of cosmic dust.
            Decorative artwork, not event footage.
          </p>
        </div>
        <div className="panel">
          <h2>Rocket launches</h2>
          <p>
            Watch authentic launch media on SpaceX's own official website. This
            illustrative section does not imply a partnership or NASA
            endorsement.
          </p>
          <ButtonLink external to="https://www.spacex.com/launches/">
            Official SpaceX launch media
          </ButtonLink>
        </div>
      </div>

      {approvedVideos.length > 0 ? (
        <div className="media-grid">
          {approvedVideos.map((video) => (
            <MediaPlayer key={video.source} video={video} />
          ))}
        </div>
      ) : (
        <Notice>
          No verified local event videos have been supplied. Pinterest
          references were inspected, but their publication rights have not been
          established; they are not used as production media.
        </Notice>
      )}
    </div>
  );
}
