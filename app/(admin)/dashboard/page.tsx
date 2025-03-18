"use client";

import { Card, Typography } from "@mui/material";
import { FaUsers } from "react-icons/fa";
import { FaBox } from "react-icons/fa6"; // Icon for products
import Grid from "@mui/material/Grid";
import { useEffect, useState, JSX } from "react";
import { useRouter } from "next/navigation"; // Import Next.js router
import Spinner from "@/app/components/spinner/Spinner";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

export default function Dashboard() {
  const router = useRouter(); // Next.js router

  const [data, setData] = useState<
    Array<{ label: string; value: number; icon: JSX.Element; route: string }>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define API endpoints, labels, and routes dynamically
  const metrics = [
    { label: "Users", endpoint: "/users", route: "/users", icon: <FaUsers /> },
    // {
    //   label: "Products",
    //   endpoint: "/products",
    //   route: "/products",
    //   icon: <FaBox />,
    // },
  ];

  const fetchData = async () => {
    try {
      const { token } = getTokenAndRole();
      const headers = { Authorization: `Bearer ${token}` };

      const results = await Promise.all(
        metrics.map(async (metric) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${metric.endpoint}`,
            { method: "GET", headers }
          );

          if (!response.ok) throw new Error(`Failed to fetch ${metric.label}`);

          const result = await response.json();
          return {
            label: metric.label,
            value: result?.totalCount || 0, // Ensure totalCount is used
            icon: metric.icon,
            route: metric.route, // Add route info
          };
        })
      );

      setData(results);
    } catch (err) {
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={5}>
          {data.map((item, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Card
                className="shadow-md rounded-lg p-4 flex items-center justify-center cursor-pointer hover:shadow-lg transition duration-300"
                style={{ height: "140px" }}
                onClick={() => router.push(item.route)} // Redirect on click
              >
                <div className="flex items-center justify-between w-full">
                  <div className="bg-blue-500 text-white text-4xl p-4 rounded-lg flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="text-end flex flex-col justify-center">
                    <Typography
                      variant="h5"
                      className="font-bold text-primary text-4xl"
                    >
                      {item.value}
                    </Typography>
                    <Typography variant="body1" className="text-gray-700 mt-1">
                      {item.label}
                    </Typography>
                  </div>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}
