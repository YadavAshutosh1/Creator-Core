import { useEffect, useRef, useState } from 'react';

const CountUp = ({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}) => {
  const [count, setCount] = useState(from);
  const countRef = useRef(from);
  const startTimeRef = useRef(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!startWhen) return;
    
    let animationFrameId;

    const easeOutExpo = (t) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const updateCount = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        if (onStart) onStart();
      }

      const elapsedTime = timestamp - startTimeRef.current - delay * 1000;

      if (elapsedTime > 0) {
        const progress = Math.min(elapsedTime / (duration * 1000), 1);
        const easedProgress = easeOutExpo(progress);
        
        let currentCount;
        if (direction === 'up') {
          currentCount = from + (to - from) * easedProgress;
        } else {
          currentCount = from - (from - to) * easedProgress;
        }

        countRef.current = currentCount;
        setCount(Math.round(currentCount));

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(updateCount);
        } else {
          if (onEnd) onEnd();
        }
      } else {
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };

    hasStartedRef.current = true;
    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [to, from, direction, delay, duration, startWhen, onStart, onEnd]);

  useEffect(() => {
    if (hasStartedRef.current && countRef.current !== to) {
      startTimeRef.current = null;
      hasStartedRef.current = false;
    }
  }, [to]);

  const formatNumber = (num) => {
    if (separator) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return num;
  };

  return <span className={className}>{formatNumber(count)}</span>;
};

export default CountUp;
