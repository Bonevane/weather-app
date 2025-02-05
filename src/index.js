import "./styles.css";
import Clear from "./icons/clear_day.svg";
import Night from "./icons/clear_night.svg";
import Cloudy from "./icons/cloudy.svg";
import Partially_Cloudy from "./icons/mostly_clear_day.svg";
import Rain from "./icons/showers_rain.svg";
import Drizzle from "./icons/drizzle.svg";
import Snow from "./icons/showers_snow.svg";
import Fog from "./icons/haze_fog_dust_smoke.svg";
import Windy from "./icons/windy.svg";
import Thunderstorm from "./icons/heavy_rain.svg";
import Pointer from "./icons/arrow-pointer.png";
import Default from "./icons/very_hot.svg";
import DayBG from "./icons/background-day.jpg";
import NightBG from "./icons/background-night.jpg";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("weather-form");
  const locationInput = document.getElementById("location");
  const weatherResult = document.getElementById("weather-result");
  const forecast = document.getElementById("forecast");
  const forecastContainer = document.getElementById("forecast-container");
  const loading = document.getElementById("loading");
  const backgroundDiv = document.getElementById("background");

  forecast.hidden = true;

  // Store current background to avoid redundant changes
  let currentBackground = null;
  setBackground({
    sunrise: "00:00:00",
    sunset: "10:00:00",
    datetime: "00:00:00",
  });

  function getWeatherIcon(condition) {
    const cond = condition.toLowerCase().split(",")[0];
    if (cond.includes("night")) return Night;
    switch (cond) {
      case "clear":
      case "sunny":
        return Clear;
      case "partially cloudy":
      case "mostly sunny":
        return Partially_Cloudy;
      case "cloudy":
      case "overcast":
        return Cloudy;
      case "rain":
      case "showers":
      case "rainy":
        return Rain;
      case "thunderstorm":
      case "storm":
        return Thunderstorm;
      case "snow":
      case "snow showers":
        return Snow;
      case "fog":
      case "haze":
        return Fog;
      case "windy":
        return Windy;
      case "drizzle":
        return Drizzle;
      default:
        return Default;
    }
  }

  function getDayName(dateStr) {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(dateStr);
    return daysOfWeek[date.getDay()];
  }

  function processCurrentWeather(data) {
    const current = data.currentConditions;
    const dayForecast = data.days && data.days.length ? data.days[0] : {};

    return {
      location: data.resolvedAddress,
      datetime: current.datetime,
      temperature: current.temp,
      feelsLike: current.feelslike,
      conditions: current.conditions,
      humidity: current.humidity,
      windSpeed: current.windspeed,
      maxTemp: dayForecast.tempmax,
      minTemp: dayForecast.tempmin,
      description: dayForecast.description,
      sunrise: dayForecast.sunrise,
      sunset: dayForecast.sunset,
    };
  }

  // Update the background container with a fade transition
  function setBackground(weather) {
    if (!weather.sunrise || !weather.sunset) return;

    const [sunriseHour, sunriseMinute] = weather.sunrise.split(":").map(Number);
    const [sunsetHour, sunsetMinute] = weather.sunset.split(":").map(Number);

    let apiTimeStr = weather.datetime;
    let timePart = apiTimeStr.includes("T")
      ? apiTimeStr.split("T")[1]
      : apiTimeStr;
    const [currentHour, currentMinute] = timePart
      .split(":")
      .slice(0, 2)
      .map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;
    const sunriseMinutes = sunriseHour * 60 + sunriseMinute;
    const sunsetMinutes = sunsetHour * 60 + sunsetMinute;

    const newBackground =
      currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes
        ? DayBG
        : NightBG;

    if (newBackground !== currentBackground) {
      currentBackground = newBackground;
      backgroundDiv.style.opacity = 0;
      setTimeout(() => {
        backgroundDiv.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${newBackground})`;
        backgroundDiv.style.opacity = 1;
      }, 500);
    }
  }

  function displayCurrentWeather(weather) {
    weatherResult.innerHTML = `
        <h2>${weather.location}</h2>
        <p>${weather.conditions}</p>
        <span class="temperature">${Math.trunc(weather.temperature)}</span>
        <p>Feels like ${weather.feelsLike}°C</p>
        <div id="details-grid">
          <div class="detail-box">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${Fog}" alt="Humidity Icon" width="20%" />
                <h3 class="details-heading">Humidity</h3>
            </div>
            <p class="large-text">${weather.humidity}<span class="small-text">%</span></p>
          </div>
          <div class="detail-box round center">
            <img src="${Pointer}" alt="Wind Icon" class="wind-pointer">
            <h3>Wind</h3>
            <p class="large-text">${weather.windSpeed}<span class="small-text">km/h</span></p>
          </div>
          <div class="detail-box">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${Clear}" alt="Sunrise Icon" width="20%" />
                <h3 class="details-heading">Sunrise</h3>
            </div>
            <p class="large-text">${
              weather.sunrise.split(":")[0] +
                ":" +
                weather.sunrise.split(":")[1] +
                '<span class="small-text">AM</span>' || "N/A"
            }</p>
          </div>
          <div class="detail-box">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${Night}" alt="Sunset Icon" width="20%" />
                <h3 class="details-heading">Sunset</h3>
            </div>
            <p class="large-text">${
              weather.sunset.split(":")[0] +
                ":" +
                weather.sunset.split(":")[1] +
                '<span class="small-text">PM</span>' || "N/A"
            }</p>
          </div>
        </div>
      `;

    setBackground(weather);
  }

  function displayForecast(forecastDays) {
    forecast.hidden = false;
    forecastContainer.innerHTML = "";
    forecastDays.slice(1).forEach((day) => {
      const dayName = getDayName(day.datetime);
      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
          <div class="temp">${Math.round(day.tempmax)}°C</div>
          <img src="${getWeatherIcon(day.conditions)}" alt="${day.conditions}" />
          <div class="day-name">${dayName}</div>
        `;
      forecastContainer.appendChild(card);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const location = locationInput.value.trim();
    if (!location) return;

    weatherResult.innerHTML = "";
    forecastContainer.innerHTML = "";
    loading.classList.remove("hidden");
    forecast.hidden = true;

    try {
      const apiKey = "4XM2QUDRBCL28CBYM3RFMWSTV";
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${apiKey}&contentType=json`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.error) {
        weatherResult.innerHTML = `<p>Error: ${data.error}</p>`;
      } else {
        const currentWeather = processCurrentWeather(data);
        displayCurrentWeather(currentWeather);
        if (data.days && data.days.length > 1) displayForecast(data.days);
      }
    } catch (error) {
      console.error(error);
      weatherResult.innerHTML = `<p>Failed to fetch weather data. Please try again later.</p>`;
    } finally {
      loading.classList.add("hidden");
    }
  });
});
