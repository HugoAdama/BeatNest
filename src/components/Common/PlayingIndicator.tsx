import React from 'react';

interface PlayingIndicatorProps {
  isPlaying?: boolean;
  size?: 'xs' | 'sm' | 'md';
  color?: 'accent' | 'primary' | 'white';
}

export const PlayingIndicator: React.FC<PlayingIndicatorProps> = ({
  isPlaying = true,
  size = 'sm',
  color = 'accent',
}) => {
  const sizeStyles = {
    xs: { container: 'h-3 gap-0.5', bar: 'w-0.5 rounded-full' },
    sm: { container: 'h-4 gap-0.5', bar: 'w-0.75 rounded-full' },
    md: { container: 'h-5 gap-1', bar: 'w-1 rounded-full' },
  }[size];

  const colorStyles = {
    accent: 'bg-[#4FD1C5]',
    primary: 'bg-[#7C5CFF]',
    white: 'bg-white',
  }[color];

  return (
    <div
      className={`flex items-end justify-center ${sizeStyles.container}`}
      aria-label="Reproduciendo audio"
    >
      <span
        className={`${sizeStyles.bar} ${colorStyles} ${
          isPlaying ? 'eq-bar-1' : 'h-1'
        } transition-all duration-200`}
        style={{ minHeight: '3px' }}
      />
      <span
        className={`${sizeStyles.bar} ${colorStyles} ${
          isPlaying ? 'eq-bar-2' : 'h-1.5'
        } transition-all duration-200`}
        style={{ minHeight: '3px' }}
      />
      <span
        className={`${sizeStyles.bar} ${colorStyles} ${
          isPlaying ? 'eq-bar-3' : 'h-1'
        } transition-all duration-200`}
        style={{ minHeight: '3px' }}
      />
      <span
        className={`${sizeStyles.bar} ${colorStyles} ${
          isPlaying ? 'eq-bar-4' : 'h-2'
        } transition-all duration-200`}
        style={{ minHeight: '3px' }}
      />
    </div>
  );
};
