import { Button } from '@react-email/components';

export interface IEmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export function EmailButton({ href, children }: IEmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        display: 'inline-block',
        backgroundColor: '#6f5e53',
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 600,
        padding: '10px 14px',
        borderRadius: 12,
        textDecoration: 'none',
      }}
    >
      {children}
    </Button>
  );
}

