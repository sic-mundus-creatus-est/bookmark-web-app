import { useContext, useState } from "react";
import { getWeatherForecast } from "@/lib/services/api-calls/testService";

import { AuthContext } from "@/lib/contexts/authContext";
import { Button } from "@/components/ui/button";
import { roles } from "@/config/roles";

export default function Home() {
  const auth = useContext(AuthContext);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWeather = async () => {
    if (auth?.user?.role.includes(roles.admin)) {
      setLoading(true);
      setError(null);
      try {
        const data = await getWeatherForecast();
        setWeatherData(data);
      } catch (err) {
        setError("Failed to fetch weather data: " + err);
      } finally {
        setLoading(false);
      }
    } else {
      setError("You cannot see the weather data as you are not an admin.");
    }
  };

  const handleLogout = () => {
    auth?.logout();
  };

  return (
    <div className="flex flex-col place-items-center p-4 space-y-4">
      <h1 className="text-7xl font-semibold">
        Welcome back,
        <b>
          <i>{auth?.user?.username}</i>
        </b>
        !
      </h1>
      <Button onClick={fetchWeather} variant="outline" className="mt-4">
        Show Weather Data
      </Button>
      {loading && <p>Loading weather data...</p>}
      {error && <p>{error}</p>}
      {weatherData && (
        <div>
          <h2 className="text-xl font-medium">Weather Forecast</h2>
          <ul className="list-disc ml-5">
            {weatherData.map((day: any, index: number) => (
              <li key={index}>
                <strong>{day.date}</strong>: {day.temperatureC}°C -{" "}
                {day.summary}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Button onClick={handleLogout} variant="outline" className="mt-4">
        Logout
      </Button>
    </div>
  );
}
