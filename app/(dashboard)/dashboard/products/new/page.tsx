import { ProductForm } from '@/components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline font-bold">New Product</h1>
        <p className="text-muted-foreground">Add a new item to your online store.</p>
      </div>
      <div className="bg-card rounded-xl border border-white/5 p-6 shadow-xl">
        <ProductForm />
      </div>
    </div>
  );
}