import { HomeFlow } from '@/components/home/HomeFlow';
import {
  SOURDOUGH_REVIVAL_GUIDE_SLUG,
  SOURDOUGH_STARTER_CHEAT_SHEET_SLUG,
} from '@/lib/products/slugs';
import { getProductBySlug } from '@/sanity/lib/queries';

export default async function Home() {
  const [revivalGuideProduct, cheatSheetProduct] = await Promise.all([
    getProductBySlug(SOURDOUGH_REVIVAL_GUIDE_SLUG),
    getProductBySlug(SOURDOUGH_STARTER_CHEAT_SHEET_SLUG),
  ]);

  return (
    <HomeFlow
      cheatSheetProduct={cheatSheetProduct}
      revivalGuideProduct={revivalGuideProduct}
    />
  );
}
