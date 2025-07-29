"use client";

import React, { useEffect, useState } from "react";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity,
} from "lucide-react";

export default function WorkOrderStatus() {
  const { token } = useTokenAndRole();
  const [healthData, setHealthData] = useState<null | {
    status: string;
    service: string;
    timestamp: string;
    uptime: number;
  }>(null);

  const [updateResponse, setUpdateResponse] = useState<null | {
    success: boolean;
    message: string;
    metrics: {
      totalWorkOrders: number;
      processedWorkOrders: number;
      updatedWorkOrders: number;
      failedWorkOrders: number;
      totalUpdatedItems: number;
      executionTimeMs: number;
    };
  }>(null);

  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!token) return;

    const GetSchedulerHealth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SCHEDULER_API_URL}/scheduler/health`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHealthData(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching scheduler health:", err);
      }
    };

    GetSchedulerHealth();
  }, [token]);

  const UpdateWorkOrderStatus = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SCHEDULER_API_URL}/scheduler/trigger-manual-update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUpdateResponse(data);
      console.log("Work order status updated:", data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating work order status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Work Order Scheduler
          </h1>
        </div>
        <p className="text-gray-600">
          Monitor scheduler health and manually trigger work order status
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Health Status */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Scheduler Health Status
          </h2>
        </div>

        <div className="p-6">
          {healthData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      healthData.status === "healthy"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {healthData.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {healthData.service}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            !error && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span>Loading health status...</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Manual Update Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            Manual Status Update
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Trigger a manual work order status update
          </p>
        </div>

        <div className="p-6">
          <button
            onClick={UpdateWorkOrderStatus}
            disabled={isUpdating || !token}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Trigger Manual Update
              </>
            )}
          </button>
        </div>
      </div>

      {/* Update Response */}
      {updateResponse && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {updateResponse.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              Update Results
            </h2>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  updateResponse.success
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {updateResponse.success ? "Success" : "Failed"}
              </div>
              <p className="text-gray-700 mt-2">{updateResponse.message}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Work Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {updateResponse.metrics.totalWorkOrders}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {updateResponse.metrics.processedWorkOrders}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Updated</p>
                <p className="text-2xl font-bold text-blue-600">
                  {updateResponse.metrics.updatedWorkOrders}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {updateResponse.metrics.failedWorkOrders}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">
                  Execution Time
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {updateResponse.metrics.executionTimeMs}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ms
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">
                  Updated Items
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {updateResponse.metrics.totalUpdatedItems}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
