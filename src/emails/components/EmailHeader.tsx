import { Section, Text } from '@react-email/components';

export interface IEmailHeaderProps {
  brandName?: string;
}

export function EmailHeader({ brandName = 'Is My Starter Dead' }: IEmailHeaderProps) {
  return (
    <Section style={{ paddingBottom: 12 }}>
      <Text style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f1f1f' }}>{brandName}</Text>
    </Section>
  );
}

