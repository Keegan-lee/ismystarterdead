import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components';

import { EmailFooter } from '../components/EmailFooter';
import { EmailHeader } from '../components/EmailHeader';
import { ProductBlock } from '../components/ProductBlock';

export interface IProductDeliveryEmailProps {
  productTitle: string;
  productDescription: string;
  productDisplayPrice: string;
  productImageUrl?: string;
  supportEmail?: string;
}

export function ProductDeliveryEmail({
  productTitle,
  productDescription,
  productDisplayPrice,
  productImageUrl,
  supportEmail,
}: IProductDeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your purchase is ready — {productTitle}</Preview>
      <Body style={{ backgroundColor: '#fdf8f2', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
          <Section
            style={{
              backgroundColor: '#f5ede0',
              border: '1px solid #c8a97e',
              borderRadius: 18,
              padding: 18,
            }}
          >
            <EmailHeader />
            <Text style={{ margin: '0 0 10px', fontSize: 14, lineHeight: '20px', color: '#1f1f1f' }}>
              Thanks for your purchase. Your file is attached to this email.
            </Text>

            <ProductBlock
              title={productTitle}
              description={productDescription}
              displayPrice={productDisplayPrice}
              imageUrl={productImageUrl}
            />

            <Text style={{ margin: '0', fontSize: 12, lineHeight: '18px', color: '#8a7968' }}>
              If you don’t see the attachment, check spam/promotions or reply and we’ll help.
            </Text>

            <EmailFooter supportEmail={supportEmail} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

