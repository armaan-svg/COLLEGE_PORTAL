import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Event date: 14 November 2026
      const targetDate = new Date('2026-11-14T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="countdown-section section">
      <div className="countdown-container">
        <h2 className="sr-only">Event countdown</h2>
        <div className="countdown" role="group" aria-label="Countdown to liftoff">
          <div className="countdown-label">
            <span className="live-dot" aria-hidden="true" />
            COUNTDOWN TO LIFTOFF
          </div>
          <div className="countdown-numbers" role="timer" aria-label="Time until the event begins">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map((unit) => (
              <div key={unit.label} className="countdown-unit">
                <strong>{String(unit.value).padStart(2, '0')}</strong>
                <span>{unit.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="countdown-date">14–16 November 2026 · Bhimtal, Uttarakhand</p>
      </div>
    </section>
  );
}
