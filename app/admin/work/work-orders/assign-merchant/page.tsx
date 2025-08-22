"use client";

import React, { useEffect, useState } from "react";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";

interface Product {
  productId: string;
  productName: string;
  workGroupName?: string;
  workTaskName?: string;
  assignedMerchantId?: string;
  poStatus?: "Generated" | "Not Generated";
  isMatched: boolean;
}

interface Merchant {
  merchantId: string;
  keycloakId: string;
  name: string;
  businessName?: string;
}

const CombinedProductsPage = () => {
  const { token } = useTokenAndRole();
  const searchParams = useSearchParams();
  const workOrderId = searchParams.get("workOrderId");

  const [products, setProducts] = useState<Product[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !workOrderId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔹 Fetch Work Order
        const woRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${workOrderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!woRes.ok)
          throw new Error(`Work Order fetch failed: ${woRes.status}`);
        const woData = await woRes.json();

        // Map matched products
        const matched = (woData.matchedProducts || []).map((p: any) => ({
          productId: p.productId,
          productName: p.name || p.productName,
          workGroupName: p.workGroupName,
          workTaskName: p.workTaskName,
          assignedMerchantId: p.assignedMerchantId,
          poStatus:
            p.poStatus === "Generated" ||
            p.poGenerated === true ||
            p.isPOGenerated === true ||
            p.purchaseOrderGenerated === true ||
            p.po_generated === true ||
            p.poId ||
            p.purchaseOrderId
              ? "Generated"
              : "Not Generated",
          isMatched: true,
        }));

        // Map unmatched products
        const unmatched = (woData.unmatchedItems || []).map((p: any) => ({
          productId: p.obsBrandGoodId,
          productName: p.itemData.brandGoodName,
          workGroupName: "N/A",
          workTaskName: "N/A",
          poStatus: "Not Generated",
          isMatched: false,
        }));

        let allProducts = [...matched, ...unmatched];
        setProducts(allProducts);

        // 🔹 Fetch Merchants
        const merchantsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!merchantsRes.ok)
          throw new Error(`Merchants fetch failed: ${merchantsRes.status}`);
        const merchantsData = await merchantsRes.json();

        let merchantsArray: Merchant[] = [];
        if (Array.isArray(merchantsData)) merchantsArray = merchantsData;
        else if (Array.isArray(merchantsData.data))
          merchantsArray = merchantsData.data;
        else if (Array.isArray(merchantsData.merchants))
          merchantsArray = merchantsData.merchants;
        else if (Array.isArray(merchantsData.data?.merchants))
          merchantsArray = merchantsData.data.merchants;

        setMerchants(merchantsArray);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, workOrderId]);

  // 🔹 Assign Merchant
  const assignMerchant = async (productId: string, merchantId: string) => {
    try {
      setProcessing(productId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${workOrderId}/products/${productId}/assign-merchant`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, merchantId }),
        }
      );
      if (!res.ok) throw new Error(`Assign failed: ${res.status}`);

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId
            ? {
                ...p,
                assignedMerchantId: merchantId,
                poStatus: p.poStatus || "Not Generated",
                isMatched: true,
              }
            : p
        )
      );
    } catch (err: any) {
      alert(`Failed to assign merchant: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  // 🔹 Unassign Merchant
  const unassignMerchant = async (productId: string) => {
    try {
      setProcessing(productId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${workOrderId}/products/${productId}/unassign-merchant`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Unassign failed: ${res.status}`);

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId
            ? { ...p, assignedMerchantId: undefined, poStatus: "Not Generated" }
            : p
        )
      );
    } catch (err: any) {
      alert(`Failed to unassign merchant: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  // 🔹 Generate PO
  const generatePO = async (productId: string) => {
    try {
      setProcessing(productId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-orders/${workOrderId}/products/${productId}/generate-po`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        if (
          res.status === 400 &&
          (text.includes("PO already exists") ||
            text.includes("already generated"))
        ) {
          setProducts((prev) =>
            prev.map((p) =>
              p.productId === productId ? { ...p, poStatus: "Generated" } : p
            )
          );
          alert("PO already exists. You can now view it.");
          return;
        }
        throw new Error(`Generate PO failed: ${res.status} ${text}`);
      }

      await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId ? { ...p, poStatus: "Generated" } : p
        )
      );
      alert("Purchase Order generated successfully!");
    } catch (err: any) {
      alert(`Failed to generate PO: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  // 🔹 Helper to get merchant name
  const getMerchantName = (id?: string) => {
    if (!id) return "Not Assigned";
    const found = merchants.find(
      (m) => m.merchantId === id || m.keycloakId === id
    );
    return found ? found.businessName || found.name : "Unknown Merchant";
  };

  if (loading) return <p className="p-6 text-lg">Loading products...</p>;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );

  return (
    <>
      <Navbar label="Assign Merchant" />
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">All Products for Work Order</h2>
        <p className="text-gray-600 mb-6">
          Work Order ID: <span className="font-medium">{workOrderId}</span>
        </p>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product, idx) => (
              <div
                key={`${product.productId}-${idx}`}
                className={`border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow ${
                  product.isMatched
                    ? "border-gray-200"
                    : "border-yellow-300 bg-yellow-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {product.productName}
                    </h3>
                    <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            product.isMatched
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.isMatched ? "Matched" : "Unmatched"}
                        </span>
                      </div>
                      <div>
                        <strong>Work Group:</strong>{" "}
                        {product.workGroupName || "N/A"}
                      </div>
                      <div>
                        <strong>Work Task:</strong>{" "}
                        {product.workTaskName || "N/A"}
                      </div>

                      {product.isMatched && (
                        <>
                          <div>
                            <strong>Assigned Merchant:</strong>{" "}
                            <span
                              className={
                                product.assignedMerchantId
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }
                            >
                              {getMerchantName(product.assignedMerchantId)}
                            </span>
                          </div>
                          <div>
                            <strong>PO Status:</strong>{" "}
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                product.poStatus === "Generated"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.poStatus === "Generated"
                                ? "✅ Generated"
                                : "❌ Not Generated"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {product.isMatched && (
                    <div className="flex flex-col sm:flex-row gap-2 ml-4">
                      {product.assignedMerchantId ? (
                        <button
                          onClick={() => unassignMerchant(product.productId)}
                          disabled={processing === product.productId}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === product.productId
                            ? "Unassigning..."
                            : "Unassign"}
                        </button>
                      ) : (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              assignMerchant(product.productId, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          defaultValue=""
                          disabled={processing === product.productId}
                          className="border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
                        >
                          <option value="" disabled>
                            Assign Merchant
                          </option>
                          {merchants.map((m, idx2) => (
                            <option
                              key={`${m.keycloakId || m.merchantId}-${idx2}`}
                              value={m.keycloakId}
                            >
                              {m.businessName ||
                                m.name ||
                                `Merchant ${idx2 + 1}`}
                            </option>
                          ))}
                        </select>
                      )}

                      {product.poStatus === "Generated" ? (
                        <a
                          href={`/admin/work/work-orders/po-data?workOrderId=${workOrderId}&productId=${product.productId}`}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
                        >
                          View PO
                        </a>
                      ) : (
                        <button
                          onClick={() => generatePO(product.productId)}
                          disabled={
                            processing === product.productId ||
                            !product.assignedMerchantId
                          }
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            !product.assignedMerchantId
                              ? "Please assign a merchant first"
                              : ""
                          }
                        >
                          {processing === product.productId
                            ? "Generating..."
                            : "Generate PO"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CombinedProductsPage;
