import { Img, Section, Text } from '@react-email/components';

export interface IProductBlockProps {
  title: string;
  description: string;
  priceLabel: string;
  imageUrl?: string;
}

export function ProductBlock({ title, description, priceLabel, imageUrl }: IProductBlockProps) {
  return (
    <Section style={{ padding: '12px 0' }}>
      {imageUrl ? (
        <Img
          src={imageUrl}
          alt={`${title} cover`}
          width="520"
          height="292"
          style={{ width: '100%', height: 'auto', borderRadius: 14, border: '1px solid #e8d5b7' }}
        />
      ) : null}
      <Text style={{ margin: '12px 0 0', fontSize: 16, fontWeight: 700, color: '#1f1f1f' }}>{title}</Text>
      <Text style={{ margin: '6px 0 0', fontSize: 13, lineHeight: '20px', color: '#6f5e53' }}>{description}</Text>
      <Text style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700, color: '#1f1f1f' }}>{priceLabel}</Text>
    </Section>
  );
}
