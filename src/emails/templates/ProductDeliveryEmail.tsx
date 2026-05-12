import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components';

import { EmailFooter } from '../components/EmailFooter';
import { EmailHeader } from '../components/EmailHeader';
import { ProductBlock } from '../components/ProductBlock';

export interface IProductDeliveryEmailProps {
  productTitle: string;
  productDescription: string;
  productPriceLabel: string;
  productImageUrl?: string;
  supportEmail?: string;
  downloadUrl?: string;
}

export function ProductDeliveryEmail({
  productTitle,
  productDescription,
  productPriceLabel,
  productImageUrl,
  supportEmail,
  downloadUrl,
}: IProductDeliveryEmailProps) {
  const isFree = productPriceLabel.trim().toLowerCase() === 'free';
  const deliveryLine = isFree
    ? downloadUrl
      ? 'Thanks for grabbing this freebie. Your download link is below.'
      : 'Thanks for grabbing this freebie. Your file is attached to this email.'
    : downloadUrl
      ? 'Thanks for your purchase. Your download link is below.'
      : 'Thanks for your purchase. Your file is attached to this email.';

  return (
    <Html>
      <Head />
      <Preview>Your file is ready — {productTitle}</Preview>
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
              {deliveryLine}
            </Text>

            <ProductBlock
              title={productTitle}
              description={productDescription}
              priceLabel={productPriceLabel}
              imageUrl={productImageUrl}
            />

            {downloadUrl ? (
              <Text style={{ margin: '10px 0 12px', fontSize: 14, lineHeight: '20px', color: '#1f1f1f' }}>
                Download: <a href={downloadUrl}>Download the eBook</a>
              </Text>
            ) : null}

            <Text style={{ margin: '0', fontSize: 12, lineHeight: '18px', color: '#8a7968' }}>
              If you don’t see it, check spam/promotions or reply and we’ll help.
            </Text>

            <EmailFooter supportEmail={supportEmail} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
