import React from 'react';
import { Button, ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, 'aria-label': ariaLabel, className = '', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        aria-label={ariaLabel}
        className={`shrink-0 ${className}`}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
