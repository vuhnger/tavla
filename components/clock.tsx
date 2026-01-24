'use client';

import { useEffect, useState } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

export function Clock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    // Set initial time
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="flex items-center gap-6">
        <ClockIcon className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1.5} />
        <div className="text-8xl md:text-9xl font-pixel">--:--</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ClockIcon className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1.5} />
      <div className="text-8xl md:text-9xl font-pixel tracking-wider">
        {time}
      </div>
    </div>
  );
}
