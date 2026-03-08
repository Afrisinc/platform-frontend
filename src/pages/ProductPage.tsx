import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";
import ProductDashboard from "@/pages/ProductDashboard";

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Redirect to platform hub if no valid product
  useEffect(() => {
    const validProducts = ["notify", "crm", "billing", "analytics"];
    if (productId && !validProducts.includes(productId)) {
      navigate("/", { replace: true });
    }
  }, [productId, navigate]);

  return (
    <PlatformLayout activeProductId={productId}>
      <ProductDashboard productId={productId} />
    </PlatformLayout>
  );
}
