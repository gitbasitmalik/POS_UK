import { useState } from 'react';
import Header from '../components/Header';
import CategoryBar from '../components/CategoryBar';
import ProductGrid from '../components/ProductGrid';
import CartSidebar from '../components/CartSidebar';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { usePosStore } from '../store';

export default function CheckoutPage() {
  const { openModal } = usePosStore();
  const [pendingAgeProduct, setPendingAgeProduct] = useState<any>(null);

  // Feature 8: Barcode Scanner
  useBarcodeScanner({
    enabled: true,
    onScan: (barcode, product) => {
      // If product is age-restricted, trigger age verification
      if (product.ageRestricted) {
        setPendingAgeProduct(product);
        openModal('age-verify', { 
          product, 
          onApprove: () => { console.log('Age verified'); },
          onReject: () => { console.log('Age verification failed'); }
        });
      }
    },
  });

  return (
    <div className="flex flex-1 min-w-0 h-full">
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <div className="flex flex-col flex-1 min-h-0 px-4 pt-3 pb-0 gap-3">
          <CategoryBar />
          <ProductGrid />
        </div>
      </div>
      <CartSidebar />
    </div>
  );
}
