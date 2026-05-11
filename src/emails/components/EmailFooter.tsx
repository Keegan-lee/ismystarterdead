import { Hr, Section, Text } from '@react-email/components';

export interface IEmailFooterProps {
  supportEmail?: string;
}

export function EmailFooter({ supportEmail = 'support@palwefrancis.com' }: IEmailFooterProps) {
  return (
    <Section style={{ paddingTop: 18 }}>
      <Hr style={{ borderColor: '#e8d5b7', margin: '0 0 12px' }} />
      <Text style={{ margin: 0, fontSize: 12, lineHeight: '18px', color: '#8a7968' }}>
        Need help? Reply to this email or contact <span style={{ color: '#6f5e53' }}>{supportEmail}</span>.
      </Text>
      <Text style={{ margin: '8px 0 0', fontSize: 12, lineHeight: '18px', color: '#8a7968' }}>
        © {new Date().getFullYear()} IsMyStarterDead
      </Text>
    </Section>
  );
}

